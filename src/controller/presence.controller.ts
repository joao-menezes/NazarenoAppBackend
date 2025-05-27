import {Request, Response} from 'express'
import PresenceModel from "../model/presence.model";
import HttpCodes from "http-status-codes";
import {SharedErrors} from "../shared/errors/shared-errors";
import logger from "../shared/utils/logger";
import UserModel from "../model/user.model";

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
       try{
           const { userId } = req.body

           if (!userId) {
               res.status(HttpCodes.BAD_REQUEST).json({ error: "User ID is required." });
               return;
           }

           const user = await UserModel.findByPk(userId);
           if (!user) {
               res.status(HttpCodes.NOT_FOUND).json({ error: "User not found." });
               return;
           }

           const existingPresence = await PresenceModel.findOne({ where: { userId } });

           if (existingPresence) {
               existingPresence.presenceCount += 1;
               await existingPresence.save();
               logger.info(`Presence updated for user: ${userId}`);
               res.status(HttpCodes.OK).json({
                   message: "Presence updated successfully",
                   presence: existingPresence,
               });
               return;
           }

           const newPresence = await PresenceModel.create({
               userId,
               presenceCount: 1
           });

           logger.info(`Presence created for user: ${userId} - ${__filename}`);
           res.status(HttpCodes.CREATED).json({
               message: "Presence recorded successfully",
               presence: newPresence,
           });
       }catch (error) {
           logger.error(`Error creating presence: ${error} - ${__filename}`);
           res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
           return;
       }
    }

    static async updatePresence(req: Request, res: Response) {
        try {
            const { presenceId, userId, presenceCount } = req.body;

            const presence = await PresenceModel.findOne({ where: { presenceId } });

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