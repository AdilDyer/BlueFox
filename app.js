if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();

const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const dbUrl = process.env.ATLASDB_URL;
const MongoStore = require("connect-mongo");
const Query = require("./models/query");
// const passport = require("passport");

// const nodemailer = require("nodemailer");
// const LocalStrategy = require("passport-local");
// const { wrap } = require("module");
const wrapasync = require("./utils/wrapasync");
// const { isAuthenticated } = require("./middleware");
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", () => {
  console.log("ERROR in Mongo Session Store ", err);
});
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.use(session(sessionOptions));
app.use(flash());
// const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(Student.authenticate()));
// passport.serializeUser(Student.serializeUser());
// passport.deserializeUser(Student.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// let isAuthenticated = wrapAsync(async (req, res, next) => {
//   if (req.isAuthenticated()) {
//     res.locals.isAuthenticated = true; // Set a variable indicating the user
//   } else {
//     res.locals.isAuthenticated = false;
//   }
//   return next();
// });
// app.use(isAuthenticated);
main()
  .then(() => {
    console.log("Connected To db");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

app.listen(5000, () => {
  console.log("server is listening to port 5000");
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/contactus", (req, res) => {
  res.render("contactus.ejs");
});

app.get("/getads", (req, res) => {
  res.render("adoptions.ejs");
});

app.post(
  "/admin",
  wrapasync(async (req, res) => {
    let newQuery = new Query(req.body);
    await newQuery.save();
    req.flash("success", "Your Query was Submitted Successfully !");
    res.redirect("/contactus");
  })
);

app.get(
  `/admin/${process.env.ADMIN_PASSWORD}`,
  wrapasync(async (req, res) => {
    let allQueries = await Query.find({});
    res.render("admin.ejs", { allQueries: allQueries });
  })
);

app.get(
  "/admin/delete/:queryId",
  wrapasync(async (req, res) => {
    let { queryId } = req.params;
    await Query.deleteMany({ _id: queryId });
    req.flash("success", "Query Deleted Successfully !");
    res.redirect(`/admin/${process.env.ADMIN_PASSWORD}`);
  })
);
