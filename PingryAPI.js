/**
 * @file Main Server file for the Pingry API
 * @author Alex Strasser
 * @version 2018.05.06
 */


//Configuration
const PORT_HTTP = 80;
const PORT_HTTPS = 443;
const RATE_LIMIT_WINDOW = 10; //Will limit users based in X minute intervals

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

const debugMode = process.argv.length > 2 && process.argv[2] == "debug";

//App setup
let app = new express();
let auth = new (require("./auth").auth)();

app.use(bodyParser.json());

app.use(helmet());
app.use(rateLimit({
  windowMs: RATE_LIMIT_WINDOW*60*1000, // 15 minutes
  max: 200
}));

app.get("/", (req, res) => {
  res.redirect("https://www.pingry.org/hp/pingry-today-app-support");
})

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

var httpServer = new express();
httpServer.use((req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.redirect("https://pingrytoday.pingry.org"+req.url);
})
httpServer.listen(PORT_HTTP);

var httpsKey = "";
var httpsCert = "";
var chain = "";

if(!debugMode){
  httpsKey = fs.readFileSync('/etc/letsencrypt/live/pingrytoday.pingry.org/privkey.pem')
  httpsCert = fs.readFileSync('/etc/letsencrypt/live/pingrytoday.pingry.org/cert.pem');
  chain = fs.readFileSync('/etc/letsencrypt/live/pingrytoday.pingry.org/chain.pem')
}

v1.refresh(() => {
  https.createServer({
    key:httpsKey,
    cert: httpsCert,
    ca: chain
  }, app).listen(PORT_HTTPS, () => console.log("SERVER LISTENING..."))
});
