import {DataTypes, Model} from "sequelize";
import {PresenceInterface, PresenceOptional} from "../interface/presence.interface";
import sequelize from "../config/sequelize.database.config";

class PresenceModel extends Model<PresenceInterface, PresenceOptional> implements PresenceInterface {
    public presenceId!: string;
    public userId!: string;
    public presenceCount!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

PresenceModel.init(
    {
        presenceId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        presenceCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        }
    },
    {
        sequelize,
        tableName: 'presences',
        modelName: 'PresenceModel',
        timestamps: true,
    }
)

export default PresenceModel;
