import {DataTypes, Model} from "sequelize";
import {User, UserOptional} from "../../interface/user.interface";
import sequelize from "../../config/sequelize.database.config";
import {RoleEnum} from "../../shared/utils/enums/role.enum";

class UserModel extends Model<User, UserOptional> implements User {
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

UserModel.init(
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
        },
        birthDate: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM(...Object.values(RoleEnum)),
            allowNull: true,
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
        },
    },
    {
        sequelize,
        tableName: 'users',
        modelName: 'UserModel',
        timestamps: true,
    }
)

export default UserModel;
