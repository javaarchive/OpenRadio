const Writable = require("stream").Writable;
const { sendInterval } = require("./config");
class MultiWritable extends Writable {
  constructor(options) {
    super(options);
    this.consumers = [];
    this.sendbuffer = [];
    this.started = false;
  }
  sendChunks() {
    //console.log(this.sendbuffer);
    if (!this.sendbuffer) {
      //console.log("Buffer not init yet")
      return;
    }
    let data = this.sendbuffer.shift();
    //console.log(this.sendbuffer);
    let count = 0;
    let total = this.consumers.length;
    //console.log("Checking for chunks!")
    console.log(data + " " + this.sendbuffer.length);
    if (data) {
      console.log("We have chunks "+Object.keys(data));
      let { chunk, encoding, callback } = data;
      for (var i = 0; i < total; i++) {
        this.consumers[i].write(chunk, encoding, function() {
          count++;
          if (count == total && callback) {
            callback();
          }
        });
      }
    }
  }
  write(chunk, encoding, callback) {
    if (!this.started) {
      this.started = true;
      var scope = this;
      setInterval(function() {
        scope.sendChunks();
      }, sendInterval);
    }
    this.sendbuffer.push({
      chunk: chunk,
      encoding: encoding,
      callback: callback
    });
    //console.log(this.sendbuffer);
    console.log("Queued Chunk " + this.sendbuffer.length);
  }
}
module.exports = { MultiWritable: MultiWritable };
