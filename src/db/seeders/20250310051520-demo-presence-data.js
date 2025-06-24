module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('presences', [
      {
        presenceId: '2e26e0c8-0662-4a8e-9e87-bf468c2b0d72',
        userId: 'e755876a-900e-45a2-91dd-71df5743c7c0',
        presenceCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        presenceId: '164728cc-e8bd-43eb-8bd8-135bdd894cc5',
        userId: '78ada912-6faa-4776-bd13-3600c249c3d9',
        presenceCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        presenceId: '7d394c54-bdc2-4c56-a10d-048dde8ff9e2',
        userId: '8ccbb20d-3de8-4659-9690-ae1d5c6d0719',
        presenceCount: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('presences', null, {});
  }
};
