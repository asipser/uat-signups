const mongoose = require("mongoose");
const signupSchema = new mongoose.Schema({
  title: String,
  description: String,
  signups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Signup" }],
  sortby: {
    type: String,
    enum: ["date", "description", "ta"],
    default: "date"
  }
});
module.exports = mongoose.model("Event", signupSchema);
