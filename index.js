require('dotenv').config()

const path  = require("path");
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const Blog = require('./models/blog');

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');


const { checkForAuthenticationCookie } = require("./middleware/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

const uri = process.env.MONGO_URL;
console.log('MongoDB URI:', uri);
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose
    .connect(process.env.MONGO_URL)
    .then((e) => console.log("MongoDB connected"));

app.set('view engine', 'ejs');
app.set("views", path.resolve("./views"));
app.use(express.static(path.resolve('./public')));
app.use(express.urlencoded({extended : false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res)=>{
    const allBlogs = await Blog.find({});
    res.render("home",{
        user: req.user,
        blog: allBlogs,
    });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);
app.listen(PORT, () => console.log(`Server started at port:${PORT}`))
