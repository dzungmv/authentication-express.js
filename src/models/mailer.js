const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const mailerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
      trim: true,
    },
    OTP: {
      require: true,
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "1m",
    },
  },
  {
    collection: "Mailers",
  }
);

//Export the model
module.exports = mongoose.model("Mailer", mailerSchema);
