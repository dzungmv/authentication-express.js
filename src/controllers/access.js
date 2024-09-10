const { Created } = require("../core/success.response");
const AccessService = require("./../services/access");

class AccessController {
  async signUp(req, res, next) {
    const createUser = await AccessService.signUp(req.body);
    new Created({
      message: "Register successfully!",
      metadata: createUser,
    }).send(res);
  }
}

module.exports = new AccessController();
