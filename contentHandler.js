const ytdl = require("ytdl-core");
const config = require("./config");
function retrieveStream(identifier) {
  if (
    identifier.startsWith("https://youtube.com") ||
    identifier.startsWith("http://youtube.com") ||
    identifier.startsWith("youtube.com") ||
    identifier.startsWith("https://www.youtube.com") ||
    identifier.startsWith("http://www.youtube.com")
  ) {
    //return ytdl(identifier, { filter: 'audioonly'});
    return ytdl(identifier, { filter: format => format.container === "mp4", highWaterMark: config.inputChunkSize});
  }
}
module.exports = { retrieveStream: retrieveStream };
