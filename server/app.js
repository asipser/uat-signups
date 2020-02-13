require("dotenv").config();

const bodyParser = require("body-parser");
const session = require("express-session");

const express = require("express");
const path = require("path");

const mongoose = require("mongoose");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const Signup = require("./models/Signup");
const Event = require("./models/Event");

const MONGO_SRV =
  "mongodb+srv://class:ihVP3K0zN2nhYJGb@cluster0-crlmv.mongodb.net/test?retryWrites=true&w=majority";
const prodDbName = "prod";
const devDbName = "dev";

// set POST request body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const publicPath = path.resolve(__dirname, "..", "client", "dist");

mongoose
  .connect(MONGO_SRV, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    dbName: process.env.NODE_ENV === "production" ? prodDbName : devDbName
  })
  .then(
    () => console.log("Connected to MongoDB"),
    err => console.log("Error connecting to MongoDB: " + err)
  );

app.use(express.static(publicPath));

app.use(
  session({
    secret: "session-secret",
    resave: false,
    saveUninitialized: true
  })
);

io.on("connect", socket => {
  socket.on("event", async (data, cb) => {
    const event = await Event.findOne({ _id: data.eventId })
      .populate("signups")
      .exec();

    cb(event);
  });

  socket.on("events", async (data, cb) => {
    const allEvents = await Event.find({})
      .populate("signups")
      .exec();
    cb(allEvents);
  });

  handleJoinSignup(socket);

  handleLeaveSignup(socket);

  handleUpdateSignup(socket);

  handleDeleteSignup(socket);

  handleCreateSignup(socket);

  handleCreateEvent(socket);

  handleDuplicateEvent(socket);

  handleDeleteEvent(socket);
});

app.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

//error handler
app.use(function(err, req, res, next) {
  const status = err.status || 500;
  if (status === 500) {
    console.error(err.stack);
  }

  res.status(status).send(err.message || "Something broke!");
});

http.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port 3000 and looking in folder ${publicPath}`);
});

function handleLeaveSignup(socket) {
  socket.on("leave_signup", async data => {
    const signup = await Signup.findByIdAndUpdate(data.signup_id, {
      $pull: { students: data.name }
    });
    io.emit("leave-signup", {
      signup_id: signup._id,
      name: data.name
    });
  });
}

function handleJoinSignup(socket) {
  socket.on("join_signup", async data => {
    const signup = await Signup.findByIdAndUpdate(data.signup_id, {
      $addToSet: { students: data.name }
    });
    io.emit("join-signup", {
      signup_id: signup._id,
      name: data.name
    });
  });
}

function handleUpdateSignup(socket) {
  socket.on("update_signup", async data => {
    const signup = await Signup.findByIdAndUpdate(data._id, data);
    io.emit("update-signup", data);
  });
}

function handleDeleteSignup(socket) {
  socket.on("delete_signup", async (data, eventId) => {
    await Signup.findByIdAndDelete(data._id);
    await Event.findByIdAndUpdate(eventId, {
      $pull: { signups: data._id }
    });
    io.emit("delete-signup", data._id);
  });
}

function handleCreateSignup(socket) {
  socket.on("create_signup", async (data, eventId) => {
    let newSignup;
    if (data._id) {
      const signup = await Signup.findById(data._id);
      signup._id = mongoose.Types.ObjectId();
      signup.isNew = true;
      signup.students = [];
      newSignup = await signup.save();
    } else {
      newSignup = await Signup.create(data);
    }

    console.log(newSignup._id);
    await Event.findByIdAndUpdate(eventId, {
      $addToSet: { signups: newSignup._id }
    });
    io.emit("create-signup", { newSignup, eventId });
  });
}

function handleCreateEvent(socket) {
  socket.on("upsert_event", async data => {
    let newEvent;
    if (data._id) {
      await Event.findByIdAndUpdate(data._id, data);
      newEvent = data;
    } else {
      newEvent = await Event.create(data);
    }
    io.emit("upsert-event", newEvent);
  });
}

function handleDeleteEvent(socket) {
  socket.on("delete_event", async eventId => {
    await Event.findByIdAndDelete(eventId);
    io.emit("delete-event", eventId);
  });
}

function handleDuplicateEvent(socket) {
  socket.on("duplicate_event", async eventId => {
    const newEvent = await Event.findById(eventId);
    newEvent._id = mongoose.Types.ObjectId();
    newEvent.isNew = true;
    Promise.all(
      newEvent.signups.map(async signupId => {
        const newSignup = await Signup.findById(signupId);
        newSignup._id = mongoose.Types.ObjectId();
        newSignup.isNew = true;
        newSignup.students = [];
        const id = (await newSignup.save())._id;
        return id;
      })
    ).then(async newSignups => {
      newEvent.signups = newSignups;
      const event = await newEvent.save();
      io.emit(
        "upsert-event",
        await Event.findById(event._id)
          .populate("signups")
          .exec()
      );
    });
  });
}
