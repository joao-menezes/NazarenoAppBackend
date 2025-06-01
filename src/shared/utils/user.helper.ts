import {RoleEnum} from "./enums/role.enum";
import RoomModel from "../../model/room.model";
import logger from "./logger";

export class UserHelper {
    static async validateCreateUserPayload(payload: any) {
        const { username, birthDate, role } = payload;

        if (!username || !birthDate || !role) {
            return 'Username, birthDate, and role are required fields.';
        }

        if (!Object.values(RoleEnum).includes(role)) {
            return 'Invalid role provided.';
        }

        return null;
    }



    static async associateUserToRoom(userId: string, roomId: string, isProfessor: boolean): Promise<void> {
        const room = await RoomModel.findOne({ where: { roomId } });

        if (!room) {
            throw new Error('Room not found.');
        }

        const updatedStudentsId = room.studentsId ? [...room.studentsId, userId] : [userId];

        await room.update({ studentsId: updatedStudentsId });

        logger.info(`${isProfessor ? 'Professor' : 'Student'} with ID ${userId} associated with room ${roomId} - ${__filename}`);
    }
}