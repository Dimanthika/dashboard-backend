module.exports = (sequelize, Sequelize) => {
  const Admin = sequelize.define("Admin", {
    email: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
    },
  });

  return Admin;
};
