module.exports = (sequelize, Sequelize) => {
  const ElectionParty = sequelize.define("ElectionParty", {
    name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
      unique: true,
    },
    description: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      required: true,
      allowNull: false,
    },
  });

  return ElectionParty;
};
