import UserModel from './user.model';
import PresenceModel from "./presence.model";
import RoomModel from "./room.model";

export const setupAssociations = () => {
    // User - Presence (1:N)
    UserModel.hasMany(PresenceModel, {
        foreignKey: 'userId',
        as: 'presences',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });

    PresenceModel.belongsTo(UserModel, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });

    // Room - Presence (1:N)
    RoomModel.hasMany(PresenceModel, {
        foreignKey: 'roomId',
        as: 'presences',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });

    PresenceModel.belongsTo(RoomModel, {
        foreignKey: 'roomId',
        as: 'room',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });
};
