import UserModel from "../model/user.model";
import RoomModel from "../model/room.model";
import logger from "../shared/utils/logger";

export class UserService {

    static async findAll() {
        try {
            return await UserModel.findAll();
        } catch (error) {
            throw new Error(`Error fetching users: ${error}`);
        }
    }

    static async findById(userId: string) {
        try {
            return await UserModel.findByPk(userId);
        }catch (error) {
            throw new Error(`Error fetching users: ${error}`);
        }
    }

    async findById(userId: string) {
        try {
            return await UserModel.findByPk(userId);
        } catch (error) {
            throw new Error(`Error fetching users: ${error}`);
        }
    }

    static async associateUserWithRoom(userId: string, roomId: string, isProfessor: boolean): Promise<void> {
            const room: RoomModel | null = await RoomModel.findOne({
                where: {
                    roomId,
                },
            });

            if (!room) {
                throw new Error('Room not found.');
            }

            const updatedStudentsId: string[] = room.studentsId ? [...room.studentsId, userId] : [userId];

            await room.update({
                studentsId: updatedStudentsId,
            });

            logger.info(`${isProfessor ? 'Professor' : 'Student'} with ID ${userId} associated with room ${roomId} - ${__filename}`);
        }

    static async updateUserRoomAssociation(userId: string, oldRoomId: string | undefined, newRoomName: string): Promise<string> { // Returns the new roomId
        const newRoom: RoomModel | null = await RoomModel.findOne({ where: { roomName: newRoomName } });
        if (!newRoom) {
            throw new Error(`Room with name "${newRoomName}" not found.`);
        }
        const newRoomId = newRoom.roomId;

        // If the new room is the same as the old one, do nothing regarding room association
        if (oldRoomId === newRoomId) {
            logger.info(`User ${userId} is already in room ${newRoomId} (name: ${newRoomName}). No change needed.`);
            return newRoomId;
        }

        // Remove user from the old room's studentsId list (assuming they are a student)
        // Add logic here if professors should also be removed/added from other lists
        if (oldRoomId) {
            const oldRoom: RoomModel | null = await RoomModel.findOne({ where: { roomId: oldRoomId } });
            if (oldRoom && oldRoom.studentsId?.includes(userId)) {
                const updatedOldStudentsId = oldRoom.studentsId.filter(id => id !== userId);
                await oldRoom.update({ studentsId: updatedOldStudentsId });
                logger.info(`User ${userId} removed from old room ${oldRoomId}'s student list - ${__filename}`);
            } else if (oldRoom) {
                logger.warn(`User ${userId} not found in expected old room ${oldRoomId}'s student list during update.`);
            } else {
                logger.warn(`Old room ${oldRoomId} not found when trying to remove user ${userId}.`);
            }
        }

        // Add user to the new room's studentsId list (assuming they are a student)
        if (!newRoom.studentsId?.includes(userId)) {
            const updatedNewStudentsId = newRoom.studentsId ? [...newRoom.studentsId, userId] : [userId];
            await newRoom.update({ studentsId: updatedNewStudentsId });
            logger.info(`User ${userId} added to new room ${newRoomId}'s student list - ${__filename}`);
        } else {
            logger.info(`User ${userId} already present in new room ${newRoomId}'s student list.`);
        }

        return newRoomId;
    }
    }