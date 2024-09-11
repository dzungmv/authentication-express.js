const { Created, SuccessResponse } = require("../core/success.response");
const AccessService = require("./../services/access");

class AccessController {
  async refreshToken(req, res, next) {
    new SuccessResponse({
      message: "Refresh token successfully!",
      metadata: await AccessService.refreshToken({
        refreshToken: req.keyStore.refreshToken,
      }),
    }).send(res);
  }

  async logout(req, res, next) {
    new SuccessResponse({
      message: "Logout successfully!",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  }

  async login(req, res, next) {
    new SuccessResponse({
      message: "Login successfully!",
      metadata: await AccessService.login(req.body),
    }).send(res);
  }

  async signUp(req, res, next) {
    console.log(req.body);

    const createUser = await AccessService.signUp(req.body);
    new Created({
      message: "Register successfully!",
      metadata: createUser,
    }).send(res);
  }
}

module.exports = new AccessController();
