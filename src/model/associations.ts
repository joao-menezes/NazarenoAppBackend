import UserModel from './user.model';
import PresenceModel from "./presence.model";

export const setupAssociations = () => {
    PresenceModel.belongsTo(UserModel, { foreignKey: 'userId',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });
    UserModel.hasMany(PresenceModel, {
        foreignKey: 'userId',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });
};
