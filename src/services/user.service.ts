import User from "../db/models/user";
import Room from "../db/models/room";
import logger from "../shared/utils/logger";
import {RoleEnum} from "../shared/utils/enums/role.enum";

export class UserService {

    static async findAll() {
        try {
            return await User.findAll();
        } catch (error) {
            throw new Error(`Error fetching users: ${error}`);
        }
    }

    static async findByPk(userId: string) {
        try {
            return await User.findByPk(userId);
        } catch (error: any) {
            logger.error(`UserService.findByPk - Failed to fetch user with ID: ${userId}`, error);
            throw new Error(`Database error while fetching user with ID: ${userId}`);
        }
    }

    static async findOne(userId: string) {
        try {
            return await User.findOne({ where: { userId } });
        }catch (error) {
            throw new Error(`Error find user: ${error}`);
        }
    }

    static async destroy(userId: string) {
        try {
            return await User.destroy({ where: { userId } });
        }catch (error) {
            throw new Error(`Error deleting users: ${error}`);
        }
    }

    static async associateUserWithRoom(userId: string, roomId: string, role: RoleEnum): Promise<void> {
            const room: Room | null = await Room.findOne({
                where: {
                    roomId,
                },
            });

            if (!room) {
                throw new Error('Room not found.');
            }

            const updatedStudentsId: string[] = room.studentsList ? [...room.studentsList, userId] : [userId];

            await room.update({
                studentsList: updatedStudentsId,
            });

            logger.info(`${role.includes(RoleEnum.PROFESSOR) ? 'Professor' : 'Student'} with ID ${userId} associated with room ${roomId} - ${__filename}`);
        }

    static async updateUserRoomAssociation(userId: string, oldRoomId: string | undefined, newRoomName: string): Promise<string> { // Returns the new roomId
        const newRoom: Room | null = await Room.findOne({ where: { roomName: newRoomName } });
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
            const oldRoom: Room | null = await Room.findOne({ where: { roomId: oldRoomId } });
            if (oldRoom && oldRoom.studentsList?.includes(userId)) {
                const updatedOldStudentsId = oldRoom.studentsList.filter(id => id !== userId);
                await oldRoom.update({ studentsList: updatedOldStudentsId });
                logger.info(`User ${userId} removed from old room ${oldRoomId}'s student list - ${__filename}`);
            } else if (oldRoom) {
                logger.warn(`User ${userId} not found in expected old room ${oldRoomId}'s student list during update.`);
            } else {
                logger.warn(`Old room ${oldRoomId} not found when trying to remove user ${userId}.`);
            }
        }

        // Add user to the new room's studentsId list (assuming they are a student)
        if (!newRoom.studentsList?.includes(userId)) {
            const updatedNewStudentsId = newRoom.studentsList ? [...newRoom.studentsList, userId] : [userId];
            await newRoom.update({ studentsList: updatedNewStudentsId });
            logger.info(`User ${userId} added to new room ${newRoomId}'s student list - ${__filename}`);
        } else {
            logger.info(`User ${userId} already present in new room ${newRoomId}'s student list.`);
        }

        return newRoomId;
    }

    static calculateAge(birthDate: Date): number {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }
}