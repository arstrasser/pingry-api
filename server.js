/**
 * @file Main Server file for the Pingry API
 * @author Alex Strasser
 * @version 2018.05.06
 */


//Configuration
const PORT_HTTP = 3000;
const PORT_HTTPS = 3001;
const KEY_REFRESH_INTERVAL = 5; //Will refresh the api keys every X minutes
const RATE_LIMIT_WINDOW = 15; //Will limit users based in X minute intervals

//Imports
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require("fs");
const path = require('path');
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser');
const v1 = require('./API/v1/v1');

//App setup
let app = new express();
let auth = new (require("./auth").auth1)();

app.use(bodyParser.json());

app.use(helmet());
app.use(rateLimit({
  windowMs: RATE_LIMIT_WINDOW*60*1000, // 15 minutes
  max: 100
}));

app.get("/testPermission", (req, res, next) => {
  return auth.mw([req.query.permission])(req, res, next);
}, (req, res) => {
  res.status(200).send("Authorized");
})

app.use("/configuration/", express.static(path.join(__dirname, 'config_build')))

app.get("/configuration/*", (req, res) => {
  res.sendFile(path.join(__dirname, "config_build", "index.html"));
})

app.use('/v1', v1.router);

//app.use('/v2', v2.router);

var httpServer = new express();
httpServer.use(function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.redirect("https://compsci.pingry.k12.nj.us:3001"+req.url);
})
httpServer.listen(PORT_HTTP);

v1.refresh(() => {
  https.createServer({
    key:fs.readFileSync('./TLS_cert/key.pem'),
    cert: fs.readFileSync('./TLS_cert/cert.pem'),
    passphrase: "Exce11ence&H0n0r"
  }, app).listen(PORT_HTTPS, () => console.log("SERVER LISTENING..."))
});

//Reloads the api keys file
setInterval(()=>apiKeys = JSON.parse(fs.readFileSync("./api_keys.json")), KEY_REFRESH_INTERVAL*60*1000);
