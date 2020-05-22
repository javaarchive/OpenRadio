// OpenRadio
const express = require("express");
const app = express();
const path = require("path");
const { MultiWritable } = require("./utils");
var session = require("express-session");
const exphbs = require("express-handlebars");
const config = require("./config");
var { retrieveStream } = require("./contentHandler");
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
let playlists = { test: ["https://www.youtube.com/watch?v=Gc3tqnhmf5U"] };
let contentStreams = {};
let streams = Object.keys(playlists);
console.log("Init Handlers");
app.get("/", (req, res) => {
  let output = "";
  for (var i = 0; i < streams.length; i++) {
    output =
      output +
      template({ name: streams[i], streamaudiopath: "/stream/" + streams[i] });
  }
  //console.log(output);
  res.render(__dirname + "/views/index.html", {
    ...config.webexports,
    ...{ stations: output }
  });
});
var ffmpeg = require("fluent-ffmpeg");
const PassThrough = require("stream").PassThrough;
app.get("/stream/:name", async function(req, res) {
  res.set({
    "Content-Type": "audio/mpeg3",
    "Content-Range": "bytes 0-",
    "Transfer-Encoding": "chunked"
  });
  res.set('Cache-Control', 'no-store')
  let name = req.params.name;
  console.log("Serving Stream " + name);
  if (!Object.keys(contentStreams).includes(name)) {
    let rawStream = retrieveStream(
      playlists[name][Math.floor(Math.random() * playlists[name].length)]
    );

    var command = ffmpeg();
    let outputStream = new MultiWritable({highWaterMark: config.chunkSize});

    var tp = ffmpeg(rawStream)
      .withNoVideo()
      .inputFormat("m4a")
      .audioCodec("libmp3lame")
      .audioBitrate(128)
      .format("mp3")
      .on("error", err => console.error(err))
      .on("end", () => console.log("Finished!"))
      .save(outputStream); // FFmpeg chain
    //rawStream.pipe(outputStream);
    contentStreams[name] = outputStream;
  }
  contentStreams[name].consumers.push(res);
  req.on("close", function() {
    contentStreams[name].consumers = contentStreams[name].consumers.filter(
      x => x != res
    );
  });
  //res.send(req.params.name);
});
// listen for requests :)
const listener = http.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
