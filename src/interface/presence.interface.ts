import {Optional} from "sequelize";

export interface PresenceInterface {
    presenceId: string;
    userId: string;
    presenceCount: number
}

export interface PresenceOptional extends Optional<PresenceInterface, 'presenceId'> {}
