const express = require('express');
const fs = require('fs');
const https = require('https');
const app = express();
const port = process.env.PORT || 1442;
const games = require('./games/main.js');
const mysql = require("mysql");
const {genImage} = require("./discordc/Color.js");
const expressWs = require('express-ws')(app);

const BUILDENV = require("./AppConstants").build

app.use((req, res, next) => {

    console.log(req.method + ": " + req.protocol + "://" + req.headers.host + req.url)
    next();
});


app.use("/download", express.static('download'))
app.use("/nim", express.static('nim'));
app.use("/tatsu/build", express.static('tatsu/build'));
app.use("/tatsu/seo", express.static('tatsu/seo'));
app.use("/color", express.static('color'));

games.create(app);

app.get('/couldajustgoogled*', (req, res) => {
    const userAgent = req.get("User-Agent");
    if(userAgent.includes("Discordbot") && !req.originalUrl.includes("embed")) {
        res.send(`<html><head><meta property="twitter:card" content="summary_large_image" /><meta property="twitter:image" content="${req.originalUrl}?embed" /></head></html>`);
    } else {
        res.sendFile(__dirname + "/thxforeffort.png")
    }
});

// app.get('/color/*', (req, res) => {
//     res.sendFile(__dirname + '/color/index.html');
// });

app.get('/color/*', (req, res) => {
    const userAgent = req.get("User-Agent");
    if(userAgent.includes("Discordbot") && !req.originalUrl.includes("embed")) {
        res.send(`<html><head><meta property="twitter:card" content="summary_large_image" /><meta property="twitter:image" content="${req.originalUrl}?embed" /></head></html>`);
    } else {
        let colors = req.originalUrl.replace(/_/g, " ").replace(/\/color\d?\/?|\?embed/g, "").replace(/^\/+|\/+$/g, "").split("/").filter(color => color.match(/[0-9a-fA-F]{6}(?::.+)/g)).map(color => color.split(":"));
        res.setHeader('Content-Type', 'image/png');
        genImage(colors).pipe(res);
    }
});

app.get('/test', (req, res) => {
    setTimeout(() => res.send("Works"), 5000);
    //res.sendFile(__dirname + "/tatsu/index.html")
});

app.get('/tatsu', (req, res) => {
    res.sendFile(__dirname + "/tatsu/index.html")
});

app.get('/tausch', (req, res) => {
    res.download(__dirname + '/tausch.rar');
});

app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log("App listening to port " + port)
})
