const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        userId: '78ada912-6faa-4776-bd13-3600c249c3d9',
        username: 'John Doe',
        birthDate: '1993-05-15',
        role: 'Student',
        userPicUrl: 'https://example.com/pic1.jpg',
        roomName: 'Room A',
        phoneNumber: '123456789',
        attendance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 'e755876a-900e-45a2-91dd-71df5743c7c0',
        username: 'Jane Smith',
        birthDate: '1998-09-25',
        role: 'Student',
        userPicUrl: 'https://example.com/pic2.jpg',
        roomName: 'Room B',
        phoneNumber: '987654321',
        attendance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: '8ccbb20d-3de8-4659-9690-ae1d5c6d0719',
        username: 'Alex Taylor',
        birthDate: '2001-12-02',
        role: 'Student',
        userPicUrl: 'https://example.com/pic3.jpg',
        roomName: 'Room C',
        phoneNumber: '555555555',
        attendance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
