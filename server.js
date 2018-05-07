/**
 * @file Main Server file for the Pingry API
 * @author Alex Strasser
 * @version 2018.05.06
 */


//Configuration
const PORT = 3000;
const KEY_REFRESH_INTERVAL = 5; //Will refresh the api keys every X minutes
const RATE_LIMIT_WINDOW = 15; //Will limit users based in X minute intervals

//Imports
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require("fs");
const path = require('path');
const bodyParser = require('body-parser');
const v1 = require('./v1');

//App setup
let app = new express();
let auth = new (require("./auth").auth1)();

app.use(bodyParser.json());

let limiter = new rateLimit({
  windowMs: RATE_LIMIT_WINDOW*60*1000, // 15 minutes
  delayAfter: 50,
  max: 200,
  delayMs: 1000
});
app.use(helmet(limiter));

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

v1.refresh(() => {
  app.listen(PORT, () => {
    console.log("Pingry API Started on port "+PORT);
  });
});

//Reloads the api keys file
setInterval(()=>apiKeys = JSON.parse(fs.readFileSync("./api_keys.json")), KEY_REFRESH_INTERVAL*60*1000);
