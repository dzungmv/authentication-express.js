const express = require("express");
const accessController = require("./../../controllers/access");
const { asyncHandler } = require("../../utils/asyncHandler");
const { authentication } = require("../../auth/authUtil");

const router = express.Router();

router.post("/user/login", asyncHandler(accessController.login));
router.post("/user/sign-up", asyncHandler(accessController.signUp));
router.post("/user/refresh-token", asyncHandler(accessController.refreshToken));
router.post(
  "/user/send-email-reset-password",
  asyncHandler(accessController.sendEmailResetPassword)
);

router.use(authentication);
router.post("/user/logout", asyncHandler(accessController.logout));
router.get(
  "/",
  asyncHandler((req, res, next) => {
    return res.status(200).json({
      hehe: "hehe",
    });
  })
);

module.exports = router;
