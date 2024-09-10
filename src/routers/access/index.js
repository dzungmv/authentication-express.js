const express = require("express");
const accessController = require("./../../controllers/access");
const { asyncHandler } = require("../../utils/asyncHandler");

const router = express.Router();

router.post("/user/sign-up", asyncHandler(accessController.signUp));

module.exports = router;
