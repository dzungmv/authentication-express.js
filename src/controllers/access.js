const { Created, SuccessResponse } = require("../core/success.response");
const AccessService = require("./../services/access");

class AccessController {
  async sendEmailResetPassword(req, res, next) {
    new SuccessResponse({
      message: "Send email successfully!",
      metadata: await AccessService.sendEmailResetPassword({
        email: req.body.email,
      }),
    }).send(res);
  }

  async refreshToken(req, res, next) {
    new SuccessResponse({
      message: "Refresh token successfully!",
      metadata: await AccessService.refreshToken({
        refreshToken: req.body.refreshToken,
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
    const createUser = await AccessService.signUp(req.body);
    new Created({
      message: "Register successfully!",
      metadata: createUser,
    }).send(res);
  }
}

module.exports = new AccessController();
