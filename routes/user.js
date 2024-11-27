const User = require('../models/user');

const { Router } = require("express");
const router = Router();

router.get("/signin",(req, res) => {
    return res.render("signin");
});

router.get("/signup",(req, res) => {
    return res.render("signup");
});

router.post("/signin", async(req, res) =>{
    const {email, password} = req.body;
    console.log(email, password);
    const token = await User.matchPasswordAndGenerateToken(email, password);

    console.log("token", token);
    return res.redirect("/");
})

router.post("/signup", async(req, res) => {
    const { fullName, email, password} = req.body;
    try{
        await 
        User.create({
        fullName,
        email, 
        password
    });
    return res.redirect("/");
} catch (error){
    console.error("Error creating user:", error);
        return res.status(500).send("Internal Server Error");
}
});


module.exports = router;