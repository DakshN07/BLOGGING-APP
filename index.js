require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const { startAutoBlogService } = require("./services/autoBlogService");

const { checkForAuthenticationCookie } = require("./middleware/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
    startAutoBlogService();
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static(path.resolve("./public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({}).sort({ createdAt: -1 });
  res.render("home", {
    user: req.user,
    blog: allBlogs,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);
app.listen(PORT, () => console.log(`Server started at port:${PORT}`));
