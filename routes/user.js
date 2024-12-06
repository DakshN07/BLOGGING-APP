const User = require('../models/user');
const express = require('express');
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
    try{
    const token = await User.matchPasswordAndGenerateToken(email, password);
    console.log("Setting cookie and redirecting to home page");
    return res.cookie('token', token).redirect("/");
    }
    catch(error){
        console.log(error);
        return res.render("signin",{
            Error: "Incorrect Email or Password", 
        });
    }
});

router.get("/logout",(req, res) => {
    res.clearCookie('token').redirect("/");
});

router.post("/signup", async(req, res) => {
    const { fullName, email, password} = req.body;
    try{
        const newUser = await User.create({
        fullName,
        email, 
        password
    });
    const token = await User.matchPasswordAndGenerateToken(email, password);
    // Set the token cookie
    return res.cookie('token', token).redirect("/");
} catch (error){
    console.error("Error creating user:", error);
        return res.status(500).send("Internal Server Error");
}
});


module.exports = router;