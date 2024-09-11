const UserModel = require("../models/user");

async function findUserByEmail({
  email,
  select = {
    email: 1,
    password: 2,
    username: 1,
    status: 1,
    roles: 1,
  },
}) {
  return await UserModel.findOne({ email }).select(select).lean();
}

module.exports = {
  findUserByEmail,
};
