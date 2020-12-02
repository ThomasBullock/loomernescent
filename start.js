const mongoose = require("mongoose");

// import environmental variables from our variables.env file
require("dotenv").config({ path: "variables.env" });

// Connect to our Database and handle an bad connections
mongoose.connect(
  `mongodb+srv://${process.env.DATABASEUSER}:${encodeURIComponent(
    process.env.DATABASEPASSWORD
  )}${process.env.DATABASEURL}`
);

mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on("error", (err) => {
  console.error(`🚫 → ${err.message}`);
});

// READY?! Let's go!

// import all of our models
require("./models/Band");
require("./models/Album");
require("./models/User");
require("./models/Pedal");

// Start our app!
const app = require("./app");
app.set("port", process.env.PORT || 7878);
const server = app.listen(app.get("port"), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

// TEMP send email
require("./handlers/mail");
