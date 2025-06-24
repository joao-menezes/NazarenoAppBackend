import {DataTypes, Model} from "sequelize";
import sequelize from "../config/sequelize.database.config";
import {RoomAttributes, RoomOptional} from "../../interface/room.interface";

class Room extends Model<RoomOptional> implements RoomAttributes {
    public roomId!: string;
    public roomName!: string;
    public attendances?: number;
    public studentsList?: string[];
    public professorsList?: string[];
    public classes?: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Room.init(
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
        studentsList: {
            defaultValue: [],
            type: DataTypes.JSON,
            allowNull: true,
        },
        professorsList: {
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

export default Room;
