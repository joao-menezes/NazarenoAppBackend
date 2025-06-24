module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('rooms', [
      {
        roomId: 'a6bc51ca-ee86-44a3-bdc4-99f61b649333',
        roomName: 'Laboratório de Informática 101',
        attendances: 15,
        studentsList: JSON.stringify(['78ada912-6faa-4776-bd13-3600c249c3d9', 'e755876a-900e-45a2-91dd-71df5743c7c0']),
        professorsList: JSON.stringify(['8ccbb20d-3de8-4659-9690-ae1d5c6d0719']),
        classes: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roomId: 'f4679b67-9bbd-412c-98eb-da8e669350e2',
        roomName: 'Sala de Aula A-205',
        attendances: 30,
        studentsList: JSON.stringify(['78ada912-6faa-4776-bd13-3600c249c3d9']),
        professorsList: JSON.stringify(['8ccbb20d-3de8-4659-9690-ae1d5c6d0719']),
        classes: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roomId: 'f58a4264-0ebb-404e-80f7-addd79a15067',
        roomName: 'Auditório Principal',
        attendances: 100,
        studentsList: JSON.stringify([]),
        professorsList: JSON.stringify(['8ccbb20d-3de8-4659-9690-ae1d5c6d0719']),
        classes: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('rooms', null, {});
  }
};
