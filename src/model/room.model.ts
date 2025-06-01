import {DataTypes, Model} from "sequelize";
import sequelize from "../config/sequelize.database.config";
import {Room, RoomOptional} from "../interface/room.interface";

class RoomModel extends Model<RoomOptional> implements Room {
    public roomId!: string;
    public roomName!: string;
    public attendances?: number;
    public studentsId?: string[];
    public professorsId?: string[];
    public classes?: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

RoomModel.init(
    {
        roomId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        roomName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        attendances: {
            type: DataTypes.NUMBER,
            defaultValue: 0,
            allowNull: false,
        },
        classes: {
            type: DataTypes.NUMBER,
            defaultValue: 0,
            allowNull: false,
        },
        studentsId: {
            defaultValue: [],
            type: DataTypes.JSON,
            allowNull: true,
        },
        professorsId: {
            type: DataTypes.JSON,
            allowNull: false,
        }
    },
    {
        sequelize,
        tableName: 'rooms',
        modelName: 'RoomModel',
        timestamps: true,
    }
)

export default RoomModel;
