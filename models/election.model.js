module.exports = (sequelize, Sequelize) => {
  const Election = sequelize.define("Election", {
    description: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
      unique: true,
    },
    electionDate: {
      type: Sequelize.DATE,
      required: true,
      allowNull: false,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      required: true,
      allowNull: false,
    },
    isComplete: {
      type: Sequelize.BOOLEAN,
      required: true,
      allowNull: false,
    },
  });

  return Election;
};
