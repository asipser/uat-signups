const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  kerberos: String
});
module.exports = mongoose.model("User", userSchema);
