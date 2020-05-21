const Writable = require("stream").Writable;
const {sendInterval} = require("./config");
class MultiWritable extends Writable {
  constructor(options) {
    super(options);
    this.consumers = [];
  }

  write(chunk, encoding, callback) {
    let count = 0;
    let total = this.consumers.length;
    for (var i = 0; i < total; i++) {
      console.log("CHUNK!");
      this.consumers[i].write(chunk, encoding, function() {
        count++;
        if (count == total && callback) {
          callback();
        }
      });
    }
  }
}
module.exports = { MultiWritable: MultiWritable };
