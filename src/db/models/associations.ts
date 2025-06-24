import User from './user';
import Presence from "./presence";
import Room from "./room";

export const setupAssociations = () => {
    // User - Presence (1:N)
    User.hasMany(Presence, {
        foreignKey: 'userId',
        as: 'presences',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });

    Presence.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });

    // Room - Presence (1:N)
    Room.hasMany(Presence, {
        foreignKey: 'roomId',
        as: 'presences',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });

    Presence.belongsTo(Room, {
        foreignKey: 'roomId',
        as: 'room',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });
};
