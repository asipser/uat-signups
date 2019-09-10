const mongoose = require("mongoose");
const signupSchema = new mongoose.Schema({
  ta: String,
  start_time: Date,
  duration: Number, //duration in hours
  description: String,
  viewable: Boolean,
  max_signups: Number,
  locked: Boolean,
  students: [String]
});
module.exports = mongoose.model("Signup", signupSchema);
