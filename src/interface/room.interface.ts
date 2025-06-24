import {Optional} from "sequelize";

export interface Room {
    roomId: string;
    roomName: string;
    studentsList?: string[];
    professorsList?: string[];
    attendances?: number;
    classes?: number;
}

export interface RoomOptional extends Optional<Room, 'roomId'> {}