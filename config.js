module.exports = {
  brand: "OpenRadio Dev",
  webexports: {
    display_brand: "OpenRadio Developement"
  },
  chunkSize: 1024,
  inputChunkSize: 1024,
  mode: "ordered",
  /*
  Ordered: Songs play in order of playlist and loop back after you're done
  Shuffle: random songs are chosen doesn't prevent two songs from playing in a row
  MAKE SURE IT'S lowercase
  */
  bitrate: 16384,// * 1024, // actually byterate, Bitrate for sending chunks Formula: 1024*bitrate/8 = 128*bitrate in this case the bitrate is 128
  flushesPerSec: 1,
  databasefilename: "sqlite://playlists.db",
  authurl: "/admin",
  flood: 10,
  chunkSplitSize: 128
};
// Configure names here
