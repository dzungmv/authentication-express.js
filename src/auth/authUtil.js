const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../utils/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const KeyTokenService = require("../services/key-token");

const signature = process.env.SIGNATURE;

async function verifyJWT(token) {
  try {
    return await JWT.verify(token, signature);
  } catch (error) {
    console.log("Error verify token:: ", error);

    if (["JsonWebTokenError", "TokenExpiredError"].includes(error.name)) {
      throw new AuthFailureError("Request unauthorization!");
    }
  }
}

async function createTokenPair({ payload }) {
  try {
    const accessToken = await JWT.sign(payload, signature, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, signature, {
      expiresIn: "7 days",
    });

    return { accessToken, refreshToken };
  } catch (error) {
    return error;
  }
}

const authentication = asyncHandler(async (req, res, next) => {
  const accessToken = req.headers["authorization"];
  if (!accessToken) {
    throw new AuthFailureError("Request unauthorization!");
  }

  const checked = await verifyJWT(accessToken);

  const userId = checked?.userId;
  if (!userId) {
    throw new AuthFailureError("Request unauthorization!");
  }

  const keyStore = await KeyTokenService.findKeyStoreById(userId);
  if (!keyStore) {
    throw new AuthFailureError("Request unauthorization!");
  }

  req.keyStore = keyStore;

  return next();
});

module.exports = { createTokenPair, authentication, verifyJWT };
