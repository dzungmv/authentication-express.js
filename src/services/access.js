const userModel = require("./../models/user");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./key-token");
const _ = require("lodash");
const { createTokenPair, verifyJWT } = require("../auth/authUtil");
const {
  BadRequestError,
  AuthFailureError,
} = require("./../core/error.response");
const { findUserByEmail } = require("./user");

const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
  SHOP: "SHOP",
};

class AccessService {
  static async refreshToken({ refreshToken }) {
    const findToken = await KeyTokenService.findRefreshTokenUsed(refreshToken);
    if (findToken) {
      const { userId } = await verifyJWT(refreshToken, findToken.privateKey);

      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something went wrong, please re-login!");
    }

    const holderToken = await KeyTokenService.findRefreshToken(refreshToken);

    if (!holderToken) {
      throw new AuthFailureError("User is not registered!");
    }

    const { email, userId } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );

    const findUser = await findUserByEmail({ email });

    if (!findUser) {
      throw new AuthFailureError("User is not registered!");
    }

    const tokens = await createTokenPair({
      payload: {
        userId: findUser._id,
        email,
      },
      publicKey: holderToken.publicKey,
      privateKey: holderToken.privateKey,
    });

    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokenUsed: refreshToken,
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  }

  static async logout({ _id }) {
    const deleteKey = await KeyTokenService.removeTokenById(_id);
    return deleteKey;
  }

  static async login({ email, password }) {
    const userHolder = await findUserByEmail({ email });

    if (!userHolder) {
      throw new AuthFailureError("Wrong username or password!");
    }

    const passwordMatch = await bcrypt.compare(password, userHolder.password);
    if (!passwordMatch) {
      throw new AuthFailureError("Wrong username or password");
    }

    const publicKey = crypto.randomBytes(64).toString("hex");
    const privateKey = crypto.randomBytes(64).toString("hex");

    const tokens = await createTokenPair({
      payload: {
        userId: userHolder._id,
        email: userHolder.email,
      },
      publicKey: publicKey,
      privateKey: privateKey,
    });

    await KeyTokenService.createTokenKey({
      userId: userHolder._id,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });

    return {
      user: _.pick(userHolder, [
        "username",
        "_id",
        "roles",
        "email",
        "status",
        "verify",
      ]),
      tokens,
    };
  }

  static async signUp({ username, email, password }) {
    const holderUser = await userModel.findOne({ email }).lean();
    if (holderUser) {
      throw new BadRequestError("Error: User already registered!");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      username,
      email,
      password: passwordHash,
      roles: [ROLES.USER],
    });

    if (newUser) {
      const publicKey = await crypto.randomBytes(64).toString("hex");
      const privateKey = await crypto.randomBytes(64).toString("hex");

      const tokens = await createTokenPair({
        payload: {
          userId: newUser._id,
          email: newUser.email,
        },
        publicKey,
        privateKey,
      });

      const keyStore = await KeyTokenService.createTokenKey({
        userId: newUser._id,
        refreshToken: tokens.refreshToken,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("User already registered!");
      }

      return {
        user: _.pick(newUser, [
          "username",
          "_id",
          "roles",
          "email",
          "status",
          "verify",
        ]),
        tokens,
      };
    }

    return {
      code: 200,
      metadata: null,
    };
  }
}

module.exports = AccessService;
