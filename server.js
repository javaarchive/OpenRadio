// OpenRadio
const express = require("express");
const app = express();
const path = require("path");
var session = require("express-session");
const exphbs = require("express-handlebars");
const config = require("./config");
app.engine(".html", exphbs({ extname: ".html" }));
app.set("view engine", ".html");
var SQLiteStore = require("connect-sqlite3")(session);
let sess = session({
  store: new SQLiteStore(),
  secret: process.env.SECRET,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
  resave: true,
  saveUninitialized: false
});
app.use(sess);
var bodyParser = require("body-parser");
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
var http = require("http").createServer(app);
//var server = http.Server(app);
var io = require("socket.io")(http);
// Setup sessions for socketio
var ios = require("socket.io-express-session");
io.use(ios(sess));
// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
var fs = require("fs");
var stationtemplate = fs.readFileSync(
  __dirname + "/views/station.html",
  "utf8"
);
console.log(stationtemplate);
const Handlebars = require("handlebars");
var template = Handlebars.compile(stationtemplate);
app.use(express.static("public"));
// Testing streams
let streams = ["test"];
app.get("/", (req, res) => {
  let output = "";
  for (var i = 0; i < streams.length; i++) {
    output =
      output +
      template({ name: streams[i], streamaudiopath: "/stream/" + streams[i] });
  }
  console.log(output);
  res.render(__dirname + "/views/index.html", {
    ...config.webexports,
    ...{ stations: output }
  });
});
app.get("/stream/:name", async function(req, res) {
  let name = req.params.name;
  if (name == "test") {
  }
  res.send(req.params.name);
});
// listen for requests :)
const listener = http.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
