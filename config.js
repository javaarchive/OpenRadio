module.exports = {
  "brand":"OpenRadio",
  "webexports":{
    "display_brand":"OpenRadio"
  },
  "chunkSize": 1024,
  "inputChunkSize": 1024,
  "bitrate": 16384 // Bitrate for sending chunks Formula: 1024*bitrate/8 = 128*bitrate in this case the bitrate is 128
}
// Configure names here