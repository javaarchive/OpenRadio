// OpenRadio
const express = require("express");
const app = express();
const path = require("path");
const { MultiWritable } = require("./utils");
var session = require("express-session");
const exphbs = require("express-handlebars");
const config = require("./config");
const Endb = require("endb");
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
var adminplaylisttemplate = fs.readFileSync(
  __dirname + "/views/admin_playlist.html",
  "utf8"
);
var adminplaylistitemtemplate = fs.readFileSync(
  __dirname + "/views/admin_playlist_item.html",
  "utf8"
);
console.log(stationtemplate);
const Handlebars = require("handlebars");
var template = Handlebars.compile(stationtemplate);
var admin_playlist_template = Handlebars.compile(adminplaylisttemplate);
var admin_playlist_item_template = Handlebars.compile(
  adminplaylistitemtemplate
);
app.use(express.static("public"));
// Testing streams
let playlists = new Endb(config.databasefilename);
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

let streamsPos = {};
console.log("Init Handlers");
app.get(config.authurl, function(req, res) {
  if (req.session.logintime) {
    res.render(__dirname + "/views/adminpanel.html", config.webexports);
  } else {
    res.render(__dirname + "/views/auth.html", config.webexports);
  }
});
app.get("/logout", function(req, res) {
  req.session.destroy();
  res.redirect(config.authurl);
});
app.post(config.authurl, function(req, res) {
  if (req.body.password == process.env.PASSWORD) {
    req.session.logintime = Date.now();
    res.render(__dirname + "/views/adminpanel.html", config.webexports);
  } else {
    res.send("Incorrect Password. Try again. ");
  }
});
app.get("/playlist_editor/:name", async function(req, res) {
  let name = req.params.name;
  if (req.session.logintime) {
    if (await playlists.has(name)) {
      let playlist = await playlists.get(name);
      let output = "";
      for (var i = 0; i < playlist.length; i++) {
        output =
          output +
          admin_playlist_item_template({
            name: playlist[i].name,
            count: playlist[i].source,
            pos: i.toString()
          });
      }
      res.render(__dirname + "/views/playlist_editor.html", {
        ...config.webexports,
        ...{ playlist_items: output, playlist_name: name }
      });
    } else {
      req.send("Not a playlist");
    }
  } else {
    req.send("Please log in");
  }
});
app.post("/playlist_editor/:name", async function(req, res) {
  if (req.session.logintime) {
    let name = req.params.name;
    if (!name) {
      res.send("No playlist name specified");
      return;
    }
    if (await playlists.has(name)) {
      let playlist = await playlists.get(name);
      if (!req.body.new_item_pos || req.body.new_item_pos == "") {
        playlist.push({
          name: req.body.item_name,
          source: req.body.item_source
        });
      } else {
        playlist.splice(req.body.new_item_pos, 0, {
          name: req.body.item_name,
          source: req.body.item_source
        });
      }
      await playlists.set(name, playlist);
      res.redirect("/playlist_editor/" + name);
    } else {
      res.send("Playlist doesn't exist");
    }
  } else {
    res.send("Please log in");
  }
});
app.get("/edit_playlists", async function(req, res) {
  if (req.session.logintime) {
    let output = "";
    let all_playlists = await playlists.all();
    for (var i = 0; i < all_playlists.length; i++) {
      output =
        output +
        admin_playlist_template({
          name: all_playlists[i]["key"],
          count: all_playlists[i]["value"].length
        });
    }
    res.render(__dirname + "/views/playlists_admin.html", {
      ...config.webexports,
      ...{ playlists: output }
    });
  } else {
    res.send("Please log in");
  }
});
app.post("/edit_playlists", async function(req, res) {
  if (req.session.logintime) {
    await playlists.set(req.body.playlist_name, []);
    res.redirect("/edit_playlists");
  } else {
    res.send("Please log in");
  }
  //res.redirect("/edit_playlists");
});
app.post("/delete_playlist_item/:name", async function(req, res) {
  if (req.session.logintime) {
    let name = req.params.name;
    if (name && (await playlists.has(name))) {
      let playlist = await playlists.get(name);
      if (req.body.delete_item_pos) {
        let pos = req.body.delete_item_pos;
        if (pos < playlist.length) {
          playlist.splice(pos, 1);
          await playlists.set(name, playlist);
          res.redirect("/playlist_editor/" + name);
        } else {
          res.send("Invalid Position");
        }
      } else {
        res.send("Specify a item index");
      }
    } else {
      res.send("Invalid Playlist Name");
    }
  } else {
    res.send("Please log in");
  }
  //res.redirect("/edit_playlists");
});
app.get("/delete_playlist/:name", async function(req, res) {
  if (req.session.logintime) {
    let name = req.params.name;
    if (name) {
      if (await playlists.has(name)) {
        res.render(__dirname + "/views/playlist_delete_confirm.html", {
          ...config.webexports,
          ...{ playlist_name: name }
        });
      } else {
        res.send("Playlist doesn't exist");
      }
    } else {
      res.send("Provide a name");
    }
  } else {
    res.send("Please log in");
  }
});
app.post("/delete_playlist/:name", async function(req, res) {
  if (req.session.logintime) {
    let name = req.params.name;
    if (name) {
      if (await playlists.has(name)) {
        await playlists.delete(name);
        res.redirect("/edit_playlists");
      } else {
        res.send("Playlist doesn't exist");
      }
    } else {
      res.send("Provide a name");
    }
  } else {
    res.send("Please log in");
  }
});
app.get("/", async (req, res) => {
  let streams = await playlists.keys();
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
var idtoplaylist = [];
io.on("connection", function(socket) {
  idtoplaylist[socket.id] = "";
  socket.on("movetoplaylist", function(data) {
    try {
      let socketsRooms = io.sockets.manager.roomClients[socket.id];
      for (var i = 0; i < socketsRooms.length; i++) {
        socket.leave(socketsRooms[i]);
      }
    } catch (ex) {}
    socket.join(data.name);
  });
  socket.on("getcurrentitem", function(data) {
    try {
      socket.emit("itemchange", {
        name: playlistToName[idtoplaylist[socket.id]]
      });
    } catch (ex) {}
  });
  socket.on("disconnect", function() {
    delete idtoplaylist[socket.id];
  });
});
var playlistToName = {};
var ffmpeg = require("fluent-ffmpeg");
const PassThrough = require("stream").PassThrough;
async function playContent(name, outputStream, realOutputStream, finish) {
  console.log("Playing playlist " + name);
  let playlist = await playlists.get(name);
  let pos = Math.floor(Math.random() * playlist.length);
  if ((config.mode = "ordered" && !Object.keys(streamsPos).includes(name))) {
    streamsPos[name] = pos;
  } else {
    streamsPos[name] += 1;
    pos = streamsPos[name] % playlist.length;
  }
  let rawStream = retrieveStream(playlist[pos]["source"]);
  playlistToName[name] = playlist[pos]["name"];
  io.to(name).emit("itemchange", { name: name, item: playlist[pos]["name"] });
  /*rawStream.on("end", function() {
    //rawStream.unpipe(processer);
  });*/
  let consumed = false;
  function replay() {
    if (!isAnyoneListening(name)) {
      return;
    }
    playContent(name, outputStream, outputStream, replay);
  }
  //console.log(outputStream);
  let processer = ffmpeg(rawStream, { highWaterMark: config.inputChunkSize })
    .withNoVideo()
    .inputFormat("m4a")
    .audioCodec("libmp3lame")
    .audioBitrate(128)
    .format("mp3")
    //.on("error", err => console.error(err))
    .on("end", function() {
      //console.warn("Unexpected end")
      consumed = true; /*this.unpipe(outputStream)*/
      processer = null;
      replay();
    }) // For some reason we keep getting too much error listeners
    .stream(outputStream, { end: false })
    .removeAllListeners("error"); // Don't close stream to keep continous play
  console.log("end: " + processer.listenerCount("end"));
  console.log("error: " + processer.listenerCount("error"));
}
const stream = require("stream");
const { ThrottleGroup, Throttle } = require("stream-throttle");
var tg = new ThrottleGroup({ rate: config.bitrate });
app.get("/stream/:name", async function(req, res) {
  if (!(await playlists.has(req.params.name))) {
    res.status(404);
    res.send("There isn't a playlist with that name");
    return;
  }
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
    let outputStream = tg.throttle();
    function replay() {
      if (!isAnyoneListening(name)) {
        return;
      }
      playContent(name, outputStream, outputStream, replay);
    }
    //var pass = new stream.PassThrough();
    playContent(name, outputStream, outputStream, replay);
    // FFmpeg chain
    /*
    pass.on("end", function() {
      console.warn("END!");
      // outputStream.onExhaust();
    });
    pass.pipe(
      outputStream,
    //  { end: false }
    );
    */
    //rawStream.pipe(outputStream);
    var pass = new stream.PassThrough({ end: false });
    outputStream.pipe(
      pass,
      { end: false }
    );

    contentStreams[name] = pass;
    pass.on("end", function() {
      //console.warn("PASS ENDED");
    });
    outputStream.on("end", function() {
      console.log("End of rate-limited stream");
    });
    console.log("pass end: " + pass.listenerCount("end"));
    console.log("output end: " + outputStream.listenerCount("error"));
  }
  contentStreams[name].pipe(
    res,
    { end: false }
  );
  req.on("close", function() {
    contentStreams[name].unpipe(res);
    listenerCounts[name]--;
    if (listenerCounts[name] <= 0) {
      delete listenerCounts[name];
      try {
        delete playlistToName[name];
      } catch (ex) {}
    }
  });
  //res.send(req.params.name);
});
// listen for requests :)
const listener = http.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
process.on("warning", e => console.warn(e.stack));
//setInterval(function(){console.log(listenerCounts)},2500);
