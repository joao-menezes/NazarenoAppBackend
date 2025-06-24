import {Optional} from "sequelize";

export interface RoomAttributes {
    roomId: string;
    roomName: string;
    studentsList?: string[];
    professorsList?: string[];
    attendances?: number;
    classes?: number;
}

export interface RoomOptional extends Optional<RoomAttributes, 'roomId'> {}