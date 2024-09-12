const userModel = require("./../models/user");
const bcrypt = require("bcrypt");
const KeyTokenService = require("./key-token");
const _ = require("lodash");
const { createTokenPair, verifyJWT } = require("../auth/authUtil");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
  NotFoundError,
  ConflictRequestError,
} = require("./../core/error.response");
const { findUserByEmail } = require("./user");
const nodeMailer = require("../utils/node-mailer");
const otpGenerator = require("otp-generator");
const MailderService = require("./mailer");

const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
  SHOP: "SHOP",
};

class AccessService {
  static async sendEmailResetPassword({ email }) {
    if (!email || !email.includes("@")) {
      throw new BadRequestError("Email not valid!");
    }

    const userHolder = await findUserByEmail({ email });
    if (!userHolder) {
      throw new NotFoundError("User not registed!");
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const sendEmail = await nodeMailer(email, otp);
    if (!sendEmail) {
      throw new ConflictRequestError("Some thing went wrong, try again!");
    }

    const saveOTP = await MailderService.createOTP({ email, otp });
    if (!saveOTP.email) {
      throw new ConflictRequestError("Some thing went wrong, try again!");
    }

    return {};
  }

  static async refreshToken({ refreshToken }) {
    const { userId, email } = await verifyJWT(refreshToken);

    const findToken = await KeyTokenService.findRefreshTokenUsed(refreshToken);
    if (findToken) {
      await KeyTokenService.removeTokenByUserId(userId);
      throw new ForbiddenError("Something went wrong, please re-login!");
    }

    const holderToken = await KeyTokenService.findRefreshToken(refreshToken);
    if (!holderToken) {
      throw new AuthFailureError("Request unauthorization!");
    }

    const findUser = await findUserByEmail({ email });

    if (!findUser) {
      throw new AuthFailureError("User is not registered!");
    }

    const tokens = await createTokenPair({
      payload: {
        userId: findUser._id,
        email,
      },
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

    const tokens = await createTokenPair({
      payload: {
        userId: userHolder._id,
        email: userHolder.email,
      },
    });

    await KeyTokenService.createTokenKey({
      userId: userHolder._id,
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
      const tokens = await createTokenPair({
        payload: {
          userId: newUser._id,
          email: newUser.email,
        },
      });

      const keyStore = await KeyTokenService.createTokenKey({
        userId: newUser._id,
        refreshToken: tokens.refreshToken,
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
