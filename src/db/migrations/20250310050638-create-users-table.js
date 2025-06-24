import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
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
        type: DataTypes.ENUM('ADMIN','STUDENT','PROFESSOR'),
        allowNull: false,
      },
      userPicUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      roomId: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
          const rawValue = this.getDataValue('roomId');
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
          this.setDataValue('roomId', JSON.stringify(value));
        }
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      attendance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('users');
};
