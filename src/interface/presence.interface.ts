import {Optional} from "sequelize";

export interface PresenceInterface {
    presenceId: string;
    userId: string;
    roomId: string;
    presenceCount: number
    annualPresenceCount: number
    monthlyPresenceCount: number
}

export interface PresenceOptional extends Optional<PresenceInterface, 'presenceId'> {}