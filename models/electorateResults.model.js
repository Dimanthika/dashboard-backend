module.exports = (sequelize, Sequelize) => {
  const ElectorateResults = sequelize.define("ElectorateResults", {
    votes: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      required: true,
    },
  });

  return ElectorateResults;
};
