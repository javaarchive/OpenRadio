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
let playlists = {
  test: [
    // "https://www.youtube.com/watch?v=B9AUUhg0Cdw",
    "https://www.youtube.com/watch?v=rUWxSEwctFU",
    "https://www.youtube.com/watch?v=vzYYW8V3Ibc"
  ],
  Chill: [
    "https://www.youtube.com/watch?v=jqkPqfOFmbY",
    "https://www.youtube.com/watch?v=p-LOXXGGeAc",
    "https://www.youtube.com/watch?v=Gc3tqnhmf5U"
  ]
};
let contentStreams = {};
let listenerCounts = {};
function isAnyoneListening(name) {
  if (Object.keys(listenerCounts).includes(name)) {
    if (listenerCounts[name] > 0) {
      return true;
    }
  }
  return false;
}
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
function playContent(name, outputStream, realOutputStream) {
  console.log("Playing playlist " + name);
  let rawStream = retrieveStream(
    playlists[name][Math.floor(Math.random() * playlists[name].length)]
  );
  let consumed = false;
  realOutputStream.thinkItIsDone = function() {
    console.log("It might be done");
    if (consumed) {
      console.log("IT is!");
      if (!isAnyoneListening(name)) {
        console.log("Nobody is listening :( goodbye");
        console.log(realOutputStream);
        realOutputStream.end();
        delete contentStreams[name];
        //outputStream.close();
        return;
      }
      playContent(name, outputStream, realOutputStream);
    }
  };
  //console.log(realOutputStream.writable);
  realOutputStream.onExhaust = function() {
    consumed = true;
    //console.log("Count "+realOutputStream.sendBuffer.length)
    console.log("Checking if buffer empty " + realOutputStream.empty);
    if (realOutputStream.empty) {
      console.log("Recursive Play");
      if (!isAnyoneListening(name)) {
        console.log("Nobody is listening :( goodbye");
        //outputStream.close();
        realOutputStream.end();
        delete contentStreams[name];
        return;
      }
      playContent(name, outputStream, realOutputStream);
    }
  };
  console.log(outputStream);
  let processer = ffmpeg(rawStream, { highWaterMark: config.inputChunkSize })
    .withNoVideo()
    .inputFormat("m4a")
    .audioCodec("libmp3lame")
    .audioBitrate(128)
    .format("mp3")
    .on("error", err => console.error(err))
    .on("end", function() {
      //console.warn("Unexpected end")
      consumed = true; /*this.unpipe(outputStream)*/
    }) //, { end: false }
    .stream(outputStream, { end: false }); // Don't close stream to keep continous play
}
const stream = require("stream");
app.get("/stream/:name", async function(req, res) {
  res.set({
    "Content-Type": "audio/mpeg3",
    "Content-Range": "bytes 0-",
    "Transfer-Encoding": "chunked"
  });
  res.set("Cache-Control", "no-store"); // WHY WOULD YOU WANNA CACHE A LIVESTREAM
  let name = req.params.name;
  if (!Object.keys(listenerCounts).includes(name)) {
    listenerCounts[name] = 0;
  }
  listenerCounts[name]++;
  console.log("Serving Stream " + name);
  if (!Object.keys(contentStreams).includes(name)) {
    let outputStream = new MultiWritable({ highWaterMark: config.chunkSize });
    var pass = new stream.PassThrough();
    playContent(name, pass, outputStream);
    // FFmpeg chain
    pass.on("end", function() {
      console.warn("END!");
      outputStream.onExhaust();
    });
    pass.pipe(
      outputStream,
      { end: false }
    );
    //rawStream.pipe(outputStream);
    contentStreams[name] = outputStream;
  }
  contentStreams[name].consumers.push(res);
  req.on("close", function() {
    contentStreams[name].consumers = contentStreams[name].consumers.filter(
      x => x != res
    );
    listenerCounts[name]--;
    if (listenerCounts[name] <= 0) {
      delete listenerCounts[name];
    }
  });
  //res.send(req.params.name);
});
// listen for requests :)
const listener = http.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
//setInterval(function(){console.log(listenerCounts)},2500);
