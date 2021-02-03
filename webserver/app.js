const express = require('express');
const fs = require('fs');
const https = require('https');
const app = express();
const port = process.env.PORT || 1442;
const games = require('./games/main.js');
const mysql = require("mysql");
const expressWs = require('express-ws')(app);

const BUILDENV = require("./AppConstants").build

app.use((req, res, next) => {

    console.log(req.method + ": " + req.protocol + "://" + req.headers.host + req.url)
    next();
});


app.use("/download", express.static('download'))
app.use("/nim", express.static('nim'));

games.create(app)

app.get('/tausch', (req, res) => {
    res.download(__dirname + '/tausch.rar');
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log("App listening to port " + port)
})
