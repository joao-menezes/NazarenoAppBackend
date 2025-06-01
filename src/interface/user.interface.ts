import {Optional} from "sequelize";
import {RoleEnum} from "../shared/utils/enums/role.enum";

export interface User {
    userId: string;
    userPicUrl?: string,
    username: string,
    birthDate: Date,
    roomId?: string,
    role: RoleEnum,
    isProfessor?: boolean,
    phoneNumber?: string
}

export interface UserOptional extends Optional<User, 'userId'> {}