import {Optional} from "sequelize";
import {RoleEnum} from "../shared/utils/enums/role.enum";

export interface UserAttributes {
    userId: string;
    userPicUrl?: string,
    username: string,
    birthDate: Date,
    roomId?: string,
    role: RoleEnum,
    phoneNumber?: string
}

export interface UserOptional extends Optional<UserAttributes, 'userId'> {}