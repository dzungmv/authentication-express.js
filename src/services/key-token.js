const { Types } = require("mongoose");
const keyModel = require("./../models/key-token");

class KeyTokenService {
  static findRefreshTokenUsed = async (refreshToken) => {
    return await keyModel
      .findOne({
        refreshTokenUsed: refreshToken,
      })
      .lean();
  };

  static findRefreshToken = async (refreshToken) => {
    return await keyModel.findOne({ refreshToken });
  };

  static removeTokenByUserId = async (userId) => {
    return await keyModel.deleteOne({
      user: Types.ObjectId.createFromHexString(userId),
    });
  };

  static async removeTokenById(_id) {
    return await keyModel.deleteOne({
      _id,
    });
  }

  static async findKeyStoreById(id) {
    return await keyModel
      .findOne({
        user: Types.ObjectId.createFromHexString(id),
      })
      .lean();
  }

  static async createTokenKey({ userId, refreshToken }) {
    try {
      const filter = { user: userId },
        update = {
          refreshToken,
          refreshTokenUsed: [],
        },
        options = {
          upsert: true,
          new: true,
        };

      const tokens = await keyModel.findOneAndUpdate(filter, update, options);

      return tokens ? tokens?.refreshToken : null;
    } catch (error) {
      return error;
    }
  }
}

module.exports = KeyTokenService;
