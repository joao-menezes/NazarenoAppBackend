import {Request, Response} from "express";
import UserModel from "../model/user.model";
import HttpCodes from "http-status-codes";
import {SharedErrors} from "../shared/errors/shared-errors";
import logger from "../shared/utils/logger";
import {RoleEnum} from "../shared/utils/enums/role.enum";
import {UserService} from "../services/user.service";

export class UserController{

    static async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await UserService.findAll();
            if (!users){
                res.status(HttpCodes.BAD_REQUEST).json(SharedErrors.UserNotFound);
                return;
            }
            logger.info(`Users retrieved successfully: ${__filename}`);
            res.status(HttpCodes.OK).json({ Users: users });
        } catch (error) {
            logger.error(`Error getting user: ${error} - ${__filename}`);
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
            return;
        }
    }

    static async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const user: UserModel | null = await UserService.findByPk(userId);
            if (!user){
                res.status(HttpCodes.BAD_REQUEST).json(SharedErrors.UserNotFound);
                return;
            }
            logger.info(`User retrieved successfully: ${__filename}`);
            res.status(HttpCodes.OK).json({ User: user });
        } catch (error) {
            logger.error(`Error getting user: ${error} - ${__filename}`);
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
            return;
        }
    }

    static async createUser(req: Request, res: Response): Promise<void> {
        try {
            const { username, birthDate, role, phoneNumber, userPicUrl, isProfessor, roomId } = req.body;

            if (!username || !birthDate || !role) {
                res.status(HttpCodes.BAD_REQUEST).json({
                    error: 'Username, birthDate, and role are required fields.',
                });
                return;
            }

            if (!isProfessor && !Object.values(RoleEnum).includes(role)) {
                res.status(HttpCodes.BAD_REQUEST).json({
                    error: 'Invalid role provided.',
                });
                return;
            }

            const userRole = isProfessor ? RoleEnum.PROFESSOR : role;

            const user: UserModel = await UserModel.create({
                username,
                birthDate,
                role: userRole,
                phoneNumber,
                userPicUrl,
                isProfessor,
            });

            if (roomId) {
                try {
                    await UserService.associateUserWithRoom(user.userId, roomId, isProfessor);
                } catch (roomError: any) {
                    logger.error(`Error associating user ${user.userId} with room ${roomId}: ${roomError.message} - ${__filename}`);
                    if (roomError.message === 'Room not found.') {
                        res.status(HttpCodes.BAD_REQUEST).json({
                            error: 'Room not found. User created but not associated.',
                        });
                        return;
                    }
                    throw roomError;
                }
            }

            logger.info(`User created successfully - ${__filename}`);

            res.status(HttpCodes.CREATED).json({
                message: 'User created successfully',
                user: {
                    ...user.get(),
                    age: UserService.calculateAge(user.birthDate),
                },
            });
        } catch (error: any) {
            logger.error(`Error in create user: ${error} - ${__filename}`);
            const errorMessage = error.message === 'Room not found.' ? 'Room not found.' : SharedErrors.InternalServerError;
            const statusCode = error.message === 'Room not found.' ? HttpCodes.BAD_REQUEST : HttpCodes.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json({
                error: errorMessage,
            });
        }
    }

    static async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { username, birthDate, role, phoneNumber, roomName, userPicUrl } = req.body;

            if (username === undefined && birthDate === undefined && role === undefined && phoneNumber === undefined && roomName === undefined && userPicUrl === undefined) {
                res.status(HttpCodes.BAD_REQUEST).json({
                    error: 'At least one valid field must be provided to update the user.',
                });
                return;
            }

            const user: UserModel | null = await UserService.findByPk(userId);
            if (!user) {
                res.status(HttpCodes.NOT_FOUND).json({ error: SharedErrors.UserNotFound });
                return;
            }

            if (role !== undefined && !user.isProfessor && !Object.values(RoleEnum).includes(role)) {
                res.status(HttpCodes.BAD_REQUEST).json({
                    error: 'Invalid role provided for a non-professor user.',
                });
                return;
            }
            if (role !== undefined && user.isProfessor) {
                logger.warn(`Attempt to update role for professor ${userId} ignored.`);
            }

            const updateFields: Partial<UserModel> = {};
            if (username !== undefined) updateFields.username = username;
            if (birthDate !== undefined) updateFields.birthDate = birthDate;
            if (role !== undefined && !user.isProfessor) updateFields.role = role;
            if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;
            if (userPicUrl !== undefined) updateFields.userPicUrl = userPicUrl;

            let newRoomId: string | undefined = user.roomId;

            if (roomName !== undefined) {
                try {
                    newRoomId = await UserService.updateUserRoomAssociation(userId, user.roomId, roomName);
                    updateFields.roomId = newRoomId;
                    logger.info(`User ${userId} room association update initiated for room name "${roomName}" (ID: ${newRoomId}) - ${__filename}`);
                } catch (roomError: any) {
                    logger.error(`Error updating room association for user ${userId} to room "${roomName}": ${roomError.message} - ${__filename}`);
                    if (roomError.message.includes('not found')) {
                        res.status(HttpCodes.BAD_REQUEST).json({
                            error: roomError.message,
                        });
                        return;
                    }
                    res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                        error: 'Failed to update room association.',
                    });
                    return;
                }
            }

            if (Object.keys(updateFields).length > 0) {
                user.set(updateFields);
                await user.save();
                logger.info(`User ${userId} fields updated successfully - ${__filename}`);
            } else {
                logger.info(`No basic fields to update for user ${userId}. Only room association might have changed.`);
            }

            const updatedUser: UserModel | null = await UserService.findByPk(userId);
            if (!updatedUser) {
                logger.error(`Failed to retrieve updated user data for ${userId} after update attempt.`);
                res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                    error: 'Failed to retrieve updated user data after update.',
                });
                return;
            }

            logger.info(`User ${userId} update process completed successfully - ${__filename}`);

            res.status(HttpCodes.OK).json({
                message: 'User updated successfully',
                user: {
                    ...updatedUser.get(),
                    age: UserService.calculateAge(updatedUser.birthDate),
                }
            });
        } catch (error: any) {
            logger.error(`Error in updateUser for userId ${req.params.userId}: ${error} - ${__filename}`);
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ error: SharedErrors.InternalServerError });
        }
    }

    static async deleteUsers(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const user: number = await UserService.destroy(userId);

            if (!user){
                res.status(HttpCodes.BAD_REQUEST).json(SharedErrors.UserNotFound);
                return;
            }

            logger.info(`User deleted successfully: ${__filename}`);
            res.status(HttpCodes.OK).json({ message: "User deleted successfully" });
        } catch (error) {
            logger.error(`Error deleting user: ${error} - ${__filename}`);
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
            return;
        }
    }
}