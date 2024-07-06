module.exports = (sequelize, Sequelize) => {
  const Node = sequelize.define("Node", {
    url: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      required: true,
      allowNull: false,
    },
  });

  return Node;
};
