module.exports = (sequelize, Sequelize) => {
  const Electorate = sequelize.define("Electorate", {
    name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
      unique: true,
    },
    currentVoters: {
      type: Sequelize.INTEGER,
      required: true,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      required: true,
      allowNull: false,
    },
  });

  return Electorate;
};
