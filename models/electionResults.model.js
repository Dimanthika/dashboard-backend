module.exports = (sequelize, Sequelize) => {
  const ElectionResults = sequelize.define("ElectionResults", {
    votes: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      required: true,
    },
  });

  return ElectionResults;
};
