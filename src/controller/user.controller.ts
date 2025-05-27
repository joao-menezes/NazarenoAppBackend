import {Request, Response} from "express";
import UserModel from "../model/user.model";
import HttpCodes from "http-status-codes";
import {SharedErrors} from "../shared/errors/shared-errors";
import logger from "../shared/utils/logger";
import {RoleEnum} from "../shared/utils/enums/role.enum";

function calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

export class UserController{

    static async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await UserModel.findAll();
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
            const user: UserModel | null = await UserModel.findByPk(userId);
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
            const { username, birthDate, role } = req.body;

            if (!username || !birthDate || !role) {
                res.status(HttpCodes.BAD_REQUEST).json({
                    error: 'Username, birthDate, and role are required fields.',
                });
                return;
            }

            if (!Object.values(RoleEnum).includes(role)) {
                res.status(HttpCodes.BAD_REQUEST).json({
                    error: 'Invalid role provided.',
                });
                return;
            }

            const user = await UserModel.create({
                username,
                birthDate,
                role,
                attendance: 0,
                phoneNumber: '',
                roomName: '',
                userPicUrl: '',
            });

            logger.info(`User created successfully - ${__filename}`);

            res.status(HttpCodes.CREATED).json({
                message: 'User created successfully',
                user: {
                    ...user.get(),
                    age: calculateAge(user.birthDate),
                }
            });
        } catch (error) {
            logger.error(`Error in create user: ${error} - ${__filename}`);
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ error: SharedErrors.InternalServerError });
        }
    }

    static async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { username, birthDate, role, phoneNumber, roomName, userPicUrl } = req.body;

            if (!username && !birthDate && !role && !phoneNumber && !roomName && !userPicUrl) {
                res.status(HttpCodes.BAD_REQUEST).json({
                    error: 'At least one valid field must be provided to update the user.',
                });
                return;
            }

            const user = await UserModel.findOne({ where: { userId } });

            if (!user) {
                res.status(HttpCodes.NOT_FOUND).json(SharedErrors.UserNotFound);
                return;
            }

            if (role && !Object.values(RoleEnum).includes(role)) {
                res.status(HttpCodes.BAD_REQUEST).json({
                    error: 'Invalid role provided.',
                });
                return;
            }

            const updateFields: Partial<typeof user> = {};
            if (username) updateFields.username = username;
            if (birthDate) updateFields.birthDate = birthDate;
            if (role) updateFields.role = role;
            if (phoneNumber) updateFields.phoneNumber = phoneNumber;
            if (roomName) updateFields.roomName = roomName;
            if (userPicUrl) updateFields.userPicUrl = userPicUrl;

            await UserModel.update(updateFields, { where: { userId } });

            const updatedUser = await UserModel.findOne({ where: { userId } });

            if (!updatedUser) {
                res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                    error: 'Failed to retrieve updated user data.',
                });
                return;
            }

            logger.info(`User updated successfully - ${__filename}`);

            res.status(HttpCodes.OK).json({
                message: 'User updated successfully',
                user: {
                    ...updatedUser.get(),
                    age: calculateAge(updatedUser.birthDate),
                }
            });
        } catch (error) {
            logger.error(`Error updating user: ${error} - ${__filename}`);
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
        }
    }

    static async deleteUsers(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            const user = await UserModel.destroy({where: { userId: userId}});
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