import {Optional} from "sequelize";

export interface PresenceAttributes {
    presenceId: string;
    userId: string;
    roomId: string;
    presenceCount: number
    annualPresenceCount: number
    monthlyPresenceCount: number
}

export interface PresenceOptional extends Optional<PresenceAttributes, 'presenceId'> {}