const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../utils/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const KeyTokenService = require("../services/key-token");

async function createTokenPair({ payload, publicKey, privateKey }) {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    JWT.decode(accessToken, publicKey, (err, decode) => {
      console.log("rub >>>>");

      if (err) {
        console.error("Error verify: ", err);
      } else {
        console.log("Verify success: ", decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {
    return error;
  }
}

const authentication = asyncHandler(async (req, res, next) => {
  const accessToken = req.headers["authorization"];
  if (!accessToken || !accessToken.includes("Bearer")) {
    throw new AuthFailureError("Request unauthorization!");
  }

  const parse = await JWT.decode(accessToken.split(" ")[1]);
  const userId = parse.userId;
  if (!userId) {
    throw new AuthFailureError("Request unauthorization!");
  }

  const keyStore = await KeyTokenService.findKeyStoreById(userId);
  if (!keyStore) {
    throw new NotFoundError("Cannot found key store!");
  }

  req.keyStore = keyStore;

  return next();
});

const verifyJWT = async (token, keySerect) => {
  return await JWT.verify(token, keySerect);
};

module.exports = { createTokenPair, authentication, verifyJWT };
