import {DataTypes, Model} from "sequelize";
import {UserAttributes, UserOptional} from "../../interface/user.interface";
import sequelize from "../config/sequelize.database.config";
import {RoleEnum} from "../../shared/utils/enums/role.enum";

class User extends Model<UserOptional> implements UserAttributes {
    public userId!: string;
    public username!: string;
    public userPicUrl!: string;
    public birthDate!: Date;
    public roomId?: string;
    public role!: RoleEnum;
    public phoneNumber!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        userId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { len: [3, 50] },
        },
        birthDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM(...Object.values(RoleEnum)),
            allowNull: true,
            defaultValue: RoleEnum.STUDENT,
        },
        userPicUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        roomId: {
            defaultValue: "none",
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'rooms',
                key: 'roomId',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: /^[0-9\-+()\s]+$/i,
            },
        },
    },
    {
        sequelize,
        tableName: 'users',
        modelName: 'UserModel',
        timestamps: true,
    }
)

export default User;
