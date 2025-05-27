import {Optional} from "sequelize";
import {RoleEnum} from "../shared/utils/enums/role.enum";

export interface User {
    userId: string;
    userPicUrl?: string,
    username: string,
    birthDate: Date,
    roomName?: string,
    role: RoleEnum,
    phoneNumber?: string,
    attendance: number
}

export interface UserOptional extends Optional<User, 'userId'> {}