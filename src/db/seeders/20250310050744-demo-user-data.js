const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        userId: '78ada912-6faa-4776-bd13-3600c249c3d9',
        username: 'John Doe',
        birthDate: '1993-05-15',
        role: 'STUDENT',
        userPicUrl: 'https://randomuser.me/api/portraits/men/40.jpg',
        roomId: ['a6bc51ca-ee86-44a3-bdc4-99f61b649333'],
        phoneNumber: '123456789',
        attendance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 'e755876a-900e-45a2-91dd-71df5743c7c0',
        username: 'Jane Smith',
        birthDate: '1998-09-25',
        role: 'STUDENT',
        userPicUrl: 'https://randomuser.me/api/portraits/women/21.jpg',
        roomId: ['f4679b67-9bbd-412c-98eb-da8e669350e2'],
        phoneNumber: '987654321',
        attendance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: '8ccbb20d-3de8-4659-9690-ae1d5c6d0719',
        username: 'Alex Taylor',
        birthDate: '2001-12-02',
        role: 'PROFESSOR',
        userPicUrl: 'https://randomuser.me/api/portraits/men/41.jpg',
        roomId: ['f58a4264-0ebb-404e-80f7-addd79a15067'],
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
