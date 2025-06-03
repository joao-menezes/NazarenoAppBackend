import {Request, Response} from "express";
import RoomModel from "../model/room.model";
import HttpCodes from "http-status-codes";
import {SharedErrors} from "../shared/errors/shared-errors";
import logger from "../shared/utils/logger";
import UserModel from "../model/user.model";
import {RoomHelper} from "../shared/utils/room.helper"
import {UserService} from "../services/user.service";

export class RoomController {
    static async getRooms(req: Request, res: Response): Promise<void> {
        try {
            const rooms = await RoomModel.findAll();

            if (!rooms) {
                res.status(HttpCodes.BAD_REQUEST).json(SharedErrors.UserNotFound);
                return
            }

            logger.info(`Rooms retrieved successfully: ${__filename}`);
            res.status(HttpCodes.OK).json({ Rooms: rooms });
        }catch (error) {
            logger.error(`Error to retrieve error: ${error}`);
            res.status(HttpCodes.NOT_FOUND).json(SharedErrors.RoomNotFound);
            return
        }
    }

    static async createRoom(req: Request, res: Response) {
        try {
            const { roomName, professorsId } = req.body;

            if (!roomName) {
                res.status(HttpCodes.BAD_REQUEST).json({
                    message: "Room name is required",
                });
                return;
            }

            if (!professorsId) {
                res.status(HttpCodes.BAD_REQUEST).json({
                    message: "Professor's ID is required",
                });
                return;
            }

            const room = await RoomModel.create({
                roomName,
                professorsId,
            });

            const professor = await UserService.findOne(professorsId);

            if (!professor) {
                res.status(HttpCodes.BAD_REQUEST).json({
                    message: "Professor not found",
                });
                return;
            }

            await professor.update({
                roomId: room.roomId,
            });

            logger.info(`Room and professor updated successfully - ${__filename}`);

            res.status(HttpCodes.CREATED).json({
                message: 'Room created and professor assigned successfully',
                room: room.roomName,
                professor: professor.username,
            });
        } catch (error) {
            logger.error(`Error in create Room: ${error} - ${__filename}`);
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                error: SharedErrors.InternalServerError,
            });
        }
    }

    static async updateRoom(req: Request, res: Response) {
        try {
            const { roomId } = req.params;
            const { roomName, professorsId, classes, studentsId, attendances } = req.body;

            const room = await RoomModel.findOne({ where: { roomId } });

            if (!room) {
                res.status(HttpCodes.NOT_FOUND).json({
                    message: "Room not found",
                    statusCode: HttpCodes.NOT_FOUND,
                });
                return
            }

            const updatedRoomData: Partial<RoomModel> = {
                roomName,
                professorsId,
                classes,
                attendances,
            };

            // Clean undefined fields to avoid overwriting unintentionally
            Object.keys(updatedRoomData).forEach(
                (key) =>
                    updatedRoomData[key as keyof typeof updatedRoomData] === undefined &&
                    delete updatedRoomData[key as keyof typeof updatedRoomData]
            );

            if (studentsId) {
                const { operation, values } = studentsId;

                if (!Array.isArray(values)) {
                    res.status(HttpCodes.BAD_REQUEST).json({
                        message: "Values must be an array",
                        statusCode: HttpCodes.BAD_REQUEST,
                    });
                    return
                }

                try {
                    updatedRoomData.studentsId = RoomHelper.handleStudentsOperation(
                        room.studentsId,
                        operation,
                        values
                    );
                } catch (error) {
                    res.status(HttpCodes.BAD_REQUEST).json({
                        message: error,
                        statusCode: HttpCodes.BAD_REQUEST,
                    });
                    return
                }
            }

            const updatedRoom = await room.update(updatedRoomData);

            logger.info(`Room updated successfully - ${__filename}`);

            res.status(HttpCodes.OK).json({
                message: 'Room updated successfully',
                room: updatedRoom,
            });
        } catch (error) {
            logger.error(`Error in update room: ${error} - ${__filename}`);
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
                error: SharedErrors.InternalServerError,
            });
            return
        }
    }


    static async deleteRoom(req: Request, res: Response): Promise<void> {
        try {
            const { roomId } = req.params;

            const room = await RoomModel.findOne({ where: { roomId: roomId } });

            if (!room) {
                res.status(HttpCodes.BAD_REQUEST).json({
                    message: "Room not found",
                    error: SharedErrors.RoomNotFound,
                })
            }

            const deletedRoom = await room?.destroy();

            logger.info(`Room deleted successfully - ${__filename}`);

            res.status(HttpCodes.OK).json({
                message: 'Room updated successfully',
                room: deletedRoom,
            });

        }catch (error) {
            logger.error(`Error in deleteRoom: ${error} - ${__filename}`);
        }
    }


}