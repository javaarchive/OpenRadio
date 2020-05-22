module.exports = {
  "brand":"OpenRadio",
  "webexports":{
    "display_brand":"OpenRadio"
  },
  "chunkSize": 1024,
  "inputChunkSize": 1024,
  "mode": "ordered",
  /*
  Ordered: Songs play in order of playlist and loop back after you're done
  Shuffle: random songs are chosen doesn't prevent two songs from playing in a row
  MAKE SURE IT'S lowercase
  */
  "bitrate": 16384, // Bitrate for sending chunks Formula: 1024*bitrate/8 = 128*bitrate in this case the bitrate is 128
  "databasefilename": "sqlite://playlists.db"
}
// Configure names here