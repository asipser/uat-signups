const passport = require("passport");
const User = require("./models/User");
const LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy(async (username, password, done) => {
    console.log(`User ${username} logged in.`);
    let user = await User.findOne({
      username: username
    });
    if (!user) {
      user = new User({
        kerberos: username
      });
      user = await user.save();
    }
    done(null, user);
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

module.exports = passport;
