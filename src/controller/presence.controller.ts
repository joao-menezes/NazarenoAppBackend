import {Request, Response} from 'express'
import PresenceModel from "../model/presence.model";
import HttpCodes from "http-status-codes";
import {SharedErrors} from "../shared/errors/shared-errors";
import logger from "../shared/utils/logger";
import UserModel from "../model/user.model";
import moment from 'moment';
import RoomModel from "../model/room.model";

export class PresenceController{
    static async getPresence(req: Request, res: Response){
        try{
            const presence: PresenceModel[] = await PresenceModel.findAll()

            if(!presence.length){
                res.status(HttpCodes.NOT_FOUND).json("Not Found")
            }

            logger.info(`Presences retrieved successfully: ${__filename}`);
            res.status(HttpCodes.OK).json({ Presence: presence });
        }catch(error){
            logger.error(`Error getting presence: ${error} - ${__filename}`);
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
            return;
        }
    }
    static async createPresence(req: Request, res: Response) {
        try {
            const { userId, roomId } = req.body;

            if (!userId || !roomId) {
                res.status(HttpCodes.BAD_REQUEST).json({ error: "User ID and Room ID are required." });
                return;
            }

            const user = await UserModel.findByPk(userId);
            if (!user) {
                res.status(HttpCodes.NOT_FOUND).json({ error: "User not found." });
                return;
            }

            // Find the room to check student list and update attendance
            const room = await RoomModel.findByPk(roomId);
            if (!room) {
                res.status(HttpCodes.NOT_FOUND).json({ error: "Room not found." });
                return;
            }

            // Check if the user is a student in this room
            const isStudentInRoom = room.studentsId?.includes(userId);

            if (!isStudentInRoom) {
                res.status(HttpCodes.NOT_FOUND).json({ error: "Student does not have a room." });
                logger.error(`Student does not have a room. ${__filename}`);
                return
            }

            let presence = await PresenceModel.findOne({ where: { userId, roomId } });

            const currentDate = moment();
            const currentYear = currentDate.year();
            const currentMonth = currentDate.month() + 1;

            let presenceCreated = false;

            if (presence) {
                presence.presenceCount += 1;
                if (moment(presence.createdAt).year() === currentYear) {
                    presence.annualPresenceCount += 1;
                } else {
                    presence.annualPresenceCount = 1;
                }

                if (moment(presence.createdAt).month() + 1 === currentMonth) {
                    presence.monthlyPresenceCount += 1;
                } else {
                    presence.monthlyPresenceCount = 1;
                }

                await presence.save();
                logger.info(`Presence updated for user: ${userId} in room: ${roomId}`);

            } else {
                presence = await PresenceModel.create({
                    userId,
                    roomId,
                    presenceCount: 1,
                    annualPresenceCount: 1,
                    monthlyPresenceCount: 1,
                });
                presenceCreated = true;
                logger.info(`Presence created for user: ${userId} in room: ${roomId}`);
            }

            if (isStudentInRoom) {
                room.attendances = (room.attendances || 0) + 1;
                await room.save();
                logger.info(`Room attendance incremented for room: ${roomId}`);
            } else {
                logger.warn(`User ${userId} is not listed as a student in room ${roomId}. Room attendance not incremented.`);
            }

            // Send response based on whether presence was created or updated
            if (presenceCreated) {
                res.status(HttpCodes.CREATED).json({
                    message: "Presence recorded successfully",
                    presence: presence,
                });
            } else {
                res.status(HttpCodes.OK).json({
                    message: "Presence updated successfully",
                    presence: presence,
                });
            }
            return;

        } catch (error) {
            logger.error(`Error creating presence: ${error} - ${__filename}`);
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
            return;
        }
    }

    static async updatePresence(req: Request, res: Response) {
        // Note: This function only updates presenceCount based on presenceId.
        // It does NOT currently increment room.attendances.
        // If this function should also increment room attendance, similar logic needs to be added here.
        try {
            const { presenceId, userId, presenceCount } = req.body;

            const presence = await PresenceModel.findOne({ where: { presenceId } });

            const user = await UserModel.findByPk(userId);
            if (!user) {
                res.status(HttpCodes.NOT_FOUND).json({ error: "User not found." });
                return;
            }

            if(!presence) {
                res.status(HttpCodes.NOT_FOUND).json(SharedErrors.PresenceNotFound);
                return;
            }

            const [updatedRows] = await PresenceModel.update(
                { presenceCount },
                { where: { presenceId, userId } }
            );

            if (updatedRows === 0) {
                res.status(HttpCodes.BAD_REQUEST).json({ error: "No presence record was updated." });
                return;
            }

            logger.info(`Presence updated successfully - ${__filename}`);
            res.status(HttpCodes.OK).json({ message: "Presence updated successfully" });
        }catch (error) {
            logger.error(`Error updating presence: ${error} - ${__filename}`);
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
            return;
        }
    }
}