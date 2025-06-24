import {DataTypes, Model} from "sequelize";
import {PresenceAttributes, PresenceOptional} from "../../interface/presenceAttributes";
import sequelize from "../config/sequelize.database.config";

class Presence extends Model<PresenceOptional> implements PresenceAttributes {
    public presenceId!: string;
    public userId!: string;
    public roomId!: string;
    public presenceCount!: number;
    public annualPresenceCount!: number;
    public monthlyPresenceCount!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Presence.init(
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
            references: {
                model: 'users',
                key: "userId",
            }
        },
        roomId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'rooms',
                key: "roomId",
            }
        },
        presenceCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        annualPresenceCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        monthlyPresenceCount: {
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

export default Presence;
