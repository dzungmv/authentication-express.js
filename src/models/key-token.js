const mongoose = require("mongoose");

var keyTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      require: true,
      ref: "User",
    },
    refreshToken: {
      type: String,
      require: true,
    },
    refreshTokenUsed: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "Keys",
  }
);

//Export the model
module.exports = mongoose.model("Key", keyTokenSchema);
