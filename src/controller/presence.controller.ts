import {Request, Response} from 'express'
import PresenceModel from "../model/presence.model";
import HttpCodes from "http-status-codes";
import {SharedErrors} from "../shared/errors/shared-errors";
import logger from "../shared/utils/logger";
import UserModel from "../model/user.model";
import moment from 'moment';
import RoomModel from "../model/room.model";
import {UserService} from "../services/user.service";

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
            const { presences } = req.body;

            if (!Array.isArray(presences) || presences.length === 0) {
                res.status(HttpCodes.BAD_REQUEST).json({ error: "Presences array is required." });
                return
            }

            const results = [];

            for (const { userId, roomId } of presences) {
                if (!userId || !roomId) {
                    results.push({
                        userId,
                        roomId,
                        status: "failed",
                        error: "User ID and Room ID are required."
                    });
                    continue;
                }

                const user = await UserService.findByPk(userId);
                if (!user) {
                    results.push({
                        userId,
                        roomId,
                        status: "failed",
                        error: "User not found."
                    });
                    continue;
                }

                const room = await RoomModel.findByPk(roomId);
                if (!room) {
                    results.push({
                        userId,
                        roomId,
                        status: "failed",
                        error: "Room not found."
                    });
                    continue;
                }

                // const isStudentInRoom = room.studentsId?.includes(userId);
                // if (!isStudentInRoom) {
                //     results.push({
                //         userId,
                //         roomId,
                //         status: "failed",
                //         error: "Student does not belong to this room."
                //     });
                //     continue;
                // }

                let presence = await PresenceModel.findOne({ where: { userId, roomId } });

                const currentDate = moment();
                const currentYear = currentDate.year();
                const currentMonth = currentDate.month() + 1;

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

                    room.attendances = (room.attendances || 0) + 1;
                    await room.save();

                    results.push({
                        userId,
                        roomId,
                        status: "updated",
                        presence
                    });

                } else {
                    const newPresence = await PresenceModel.create({
                        userId,
                        roomId,
                        presenceCount: 1,
                        annualPresenceCount: 1,
                        monthlyPresenceCount: 1,
                    });

                    room.attendances = (room.attendances || 0) + 1;
                    await room.save();

                    logger.info(`Presence created for user: ${userId} in room: ${roomId}`);

                    results.push({
                        userId,
                        roomId,
                        status: "created",
                        presence: newPresence
                    });
                }
            }
            res.status(HttpCodes.OK).json({
                message: "Presence processing completed",
                results
            });
            return

        } catch (error) {
            logger.error(`Error in createPresenceList: ${error} - ${__filename}`);
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
            return
        }
    }

    static async updatePresence(req: Request, res: Response) {
        // Note: This function only updates presenceCount based on presenceId.
        // It does NOT currently increment room.attendances.
        // If this function should also increment room attendance, similar logic needs to be added here.
        try {
            const { presenceId, userId, presenceCount } = req.body;

            const presence = await PresenceModel.findOne({ where: { presenceId } });

            const user = await UserService.findByPk(userId);
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