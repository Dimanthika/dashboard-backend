// const db = require("../models");
// const { user: User, tenant: Tenant } = db;

// findUser = async (tenantId, email, res) => {
//   try {
//     var user = await User.findOne({
//       where: {
//         tenant: tenantId,
//         email: email,
//       },
//     });
//     return user;
//   } catch (err) {
//     res.status(500).send(err);
//   }
// };

// const verifySignUp = {
//   findUser: findUser,
// };

// module.exports = verifySignUp;
