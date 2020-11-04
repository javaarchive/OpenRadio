const ytdl = require("ytdl-core");
const config = require("./config");
const fs = require("fs");
function retrieveStream(identifier) {
  /*if (identifier) {
    let dummy = fs.createReadStream("streamtest.txt");
    dummy.on("error", console.warn);
    return dummy;
  }*/
  if (
    identifier.startsWith("https://youtube.com") ||
    identifier.startsWith("http://youtube.com") ||
    identifier.startsWith("youtube.com") ||
    identifier.startsWith("https://www.youtube.com") ||
    identifier.startsWith("http://www.youtube.com") ||
    identifier.startsWith("http://youtu.be") ||
    identifier.startsWith("https://youtu.be")
  ) {
    //return ytdl(identifier, { filter: 'audioonly'});
    return ytdl(identifier, {
      filter: format => format.container === "mp4",
      highWaterMark: config.inputChunkSize,
      end: false
    }); // End: false required to prevent closing
  }
}
module.exports = { retrieveStream: retrieveStream };
