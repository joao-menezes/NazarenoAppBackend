'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rooms', {
      roomId: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      roomName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      attendances: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      classes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      studentsList: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      professorsList: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('rooms');
  },
};
