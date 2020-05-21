const ytdl = require('ytdl-core');
function retrieveStream(identifier){
  if(identifier.startsWith("https://youtube.com") || identifier.startsWith("http://youtube.com") || identifier.startsWith("youtube.com") || identifier.startsWith("https://www.youtube.com") || identifier.startsWith("http://www.youtube.com") ){
    return ytdl(identifier, { filter: 'audioonly'});
  }
}
module.exports = {retrieveStream: retrieveStream};