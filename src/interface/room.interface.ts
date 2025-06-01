import {Optional} from "sequelize";

export interface Room {
    roomId: string;
    roomName: string;
    studentsId?: string[];
    professorsId?: string[];
    attendances?: number;
    classes?: number;
}

export interface RoomOptional extends Optional<Room, 'roomId'> {}