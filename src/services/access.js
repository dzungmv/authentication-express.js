const userModel = require("./../models/user");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./key-token");
const _ = require("lodash");
const { createTokenPair } = require("../auth/authUtil");
const { BadRequestError } = require("./../core/error.response");

const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
  SHOP: "SHOP",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    const holderUser = await userModel.findOne({ email }).lean();
    if (holderUser) {
      throw new BadRequestError("Error: User already registered!");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      email,
      password: passwordHash,
      roles: [ROLES.USER],
    });

    if (newUser) {
      const publicKey = crypto.randomBytes(64).toString("hex");
      const privateKey = crypto.randomBytes(64).toString("hex");

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newUser._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("Error: User already registered!");
      }

      const tokens = await createTokenPair({
        payload: {
          userId: newUser._id,
        },
        publicKey: publicKey,
        privateKey: privateKey,
      });

      return {
        code: 201,
        metadata: {
          user: getInfoData({
            fields: ["_id", "name", "email"],
            obj: newUser,
          }),
          tokens,
        },
      };
    }

    return {
      code: 200,
      metadata: null,
    };
  };
}

module.exports = AccessService;
