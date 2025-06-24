import {Request, Response} from 'express'
import Presence from "../db/models/presence";
import HttpCodes from "http-status-codes";
import {SharedErrors} from "../shared/errors/shared-errors";
import logger from "../shared/utils/logger";
import User from "../db/models/user";
import moment from 'moment';
import Room from "../db/models/room";
import {UserService} from "../services/user.service";

export class PresenceController{
    static async getPresence(req: Request, res: Response){
        try{
            const presence: Presence[] = await Presence.findAll()

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

    static async createPresence(req: Request, res: Response): Promise<void> {
        try {
            const { presences } = req.body;

            if (!Array.isArray(presences) || presences.length === 0) {
                res.status(HttpCodes.BAD_REQUEST).json({ error: "Presences array is required and cannot be empty." });
                return;
            }

            const uniqueUserIds = [...new Set(presences.map(p => p.userId).filter(Boolean))];
            const uniqueRoomIds = [...new Set(presences.map(p => p.roomId).filter(Boolean))];

            const [users, rooms] = await Promise.all([
                User.findAll({ where: { userId: uniqueUserIds } }), // Assumindo que UserService.findAll aceita um array de IDs
                Room.findAll({ where: { roomId: uniqueRoomIds } })
            ]);

            const userMap = new Map(users.map(u => [u.userId, u])); // Assumindo que o ID do usuário é 'id'
            const roomMap = new Map(rooms.map(r => [r.roomId, r]));

            // Processar cada presença em paralelo
            const results = await Promise.allSettled(presences.map(async ({ userId, roomId }) => {
                // Validação básica de entrada para cada item
                if (!userId || !roomId) {
                    return {
                        userId,
                        roomId,
                        status: "failed",
                        error: "User ID and Room ID are required for each presence entry."
                    };
                }

                const user = userMap.get(userId);
                if (!user) {
                    return {
                        userId,
                        roomId,
                        status: "failed",
                        error: "User not found."
                    };
                }

                const room = roomMap.get(roomId);
                if (!room) {
                    return {
                        userId,
                        roomId,
                        status: "failed",
                        error: "Room not found."
                    };
                }

                // **IMPORTANTE:** Reativar e corrigir a verificação de estudante na sala
                // Assumindo que room.studentsList é um array de strings (UUIDs) devido ao DataTypes.JSON
                if (room.studentsList && !room.studentsList.includes(userId)) {
                    return {
                        userId,
                        roomId,
                        status: "failed",
                        error: "Student does not belong to this room."
                    };
                }

                let presenceRecord = await Presence.findOne({ where: { userId, roomId } });

                const currentDate = moment();
                const currentYear = currentDate.year();
                const currentMonth = currentDate.month() + 1;

                if (presenceRecord) {
                    presenceRecord.presenceCount += 1;

                    // **Lógica Corrigida:** Comparar com a data da última atualização (updatedAt)
                    const lastUpdateMoment = moment(presenceRecord.updatedAt);

                    if (lastUpdateMoment.year() < currentYear) {
                        presenceRecord.annualPresenceCount = 1; // Novo ano, resetar
                    } else {
                        presenceRecord.annualPresenceCount += 1; // Mesmo ano, continuar contando
                    }

                    // Se o ano mudou OU o mês mudou (dentro do mesmo ano)
                    if (lastUpdateMoment.year() < currentYear || lastUpdateMoment.month() < currentMonth) {
                        presenceRecord.monthlyPresenceCount = 1; // Novo mês/ano, resetar
                    } else {
                        presenceRecord.monthlyPresenceCount += 1; // Mesmo mês/ano, continuar contando
                    }

                    await presenceRecord.save();

                    logger.info(`Presence updated for user: ${userId} in room: ${roomId}`);

                    // Atualizar attendances do quarto
                    room.attendances = (room.attendances || 0) + 1;
                    await room.save();

                    return {
                        userId,
                        roomId,
                        status: "updated",
                        presence: presenceRecord
                    };

                } else {
                    // Criar novo registro de presença
                    const newPresence = await Presence.create({
                        userId,
                        roomId,
                        presenceCount: 1,
                        annualPresenceCount: 1,
                        monthlyPresenceCount: 1,
                    });

                    logger.info(`Presence created for user: ${userId} in room: ${roomId}`);

                    // Atualizar attendances do quarto
                    room.attendances = (room.attendances || 0) + 1;
                    await room.save();

                    return {
                        userId,
                        roomId,
                        status: "created",
                        presence: newPresence
                    };
                }
            }));

            // Formatar os resultados de Promise.allSettled
            const formattedResults = results.map(result => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    // Lidar com promessas rejeitadas (erros inesperados durante o processamento de um item)
                    logger.error(`Erro inesperado ao processar presença: ${result.reason}`);
                    return {
                        status: "failed",
                        error: "An unexpected error occurred during processing for this entry."
                    };
                }
            });

            res.status(HttpCodes.OK).json({
                message: "Presence processing completed",
                results: formattedResults
            });

        } catch (error) {
            logger.error(`Error in createPresence: ${error} - ${__filename}`);
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError); // Use SharedErrors para consistência
        }
    }

    static async updatePresence(req: Request, res: Response) {
        // Note: This function only updates presenceCount based on presenceId.
        // It does NOT currently increment room.attendances.
        // If this function should also increment room attendance, similar logic needs to be added here.
        try {
            const { presenceId, userId, presenceCount } = req.body;

            const presence = await Presence.findOne({ where: { presenceId } });

            const user = await UserService.findByPk(userId);
            if (!user) {
                res.status(HttpCodes.NOT_FOUND).json({ error: "User not found." });
                return;
            }

            if(!presence) {
                res.status(HttpCodes.NOT_FOUND).json(SharedErrors.PresenceNotFound);
                return;
            }

            const [updatedRows] = await Presence.update(
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