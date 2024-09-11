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

  static deleteKeyById = async (userId) => {
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
    console.log(id);

    return await keyModel
      .findOne({
        user: Types.ObjectId.createFromHexString(id),
      })
      .lean();
  }

  static async createTokenKey({ userId, publicKey, privateKey, refreshToken }) {
    try {
      const filter = { user: userId },
        update = {
          publicKey,
          privateKey,
          refreshToken,
          refreshTokenUsed: [],
        },
        options = {
          upsert: true,
          new: true,
        };

      const tokens = await keyModel.findOneAndUpdate(filter, update, options);

      return tokens ? tokens?.publicKey : null;
    } catch (error) {
      return error;
    }
  }
}

module.exports = KeyTokenService;
