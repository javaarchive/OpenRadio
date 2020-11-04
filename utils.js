const Writable = require("stream").Writable;
const { sendInterval } = require("./config");
const { Passthrough, Transform } = require("stream");

class SyncStream extends Transform {
  constructor(limit, maxSize) {
    super();
    this.queue = [];
    this.limit = limit;
    this.chunkSize = limit; // Apparently my ignorance caused this to be needed
    this.maxSize = maxSize;
    this.curIncomplete = Buffer.alloc(0);
    //this.cb = function() {};
    this.cbs = [];
   this.dead = false;
    this.shock = null;
    this.flushInterval = setInterval(this.flushData.bind(this), 1000);
  }
  stop(){
    console.log("Sync Stream stopped");
    clearInterval(this.flushInterval);
    this.dead = true;
  }
  sendShock(x){
    // Suddenly send x chunks on next flush (normally used when new client joins because google home requires like 30 seconds of audio until it actually starts playing)
    this.shock = x;
  }
  _transform(chunk, encoding, done) {
    if(this.dead){
      this.emit("end");
      this.emit("close");
      this.destroy();
      done();
      return;
      //throw "Dead stream";
    }
    //console.log("Got", chunk);
    if (this.curIncomplete.length > 0) {
      console.log("Incomplete not empty so appending");
      chunk = this.curIncomplete + chunk;
      this.curIncomplete = Buffer.alloc(0);
      //console.log("Cl")
    }
    let overflowed = false;
    console.log(chunk.length, Math.floor(chunk.length / this.chunkSize));
    for (let i = 0; i < Math.floor(chunk.length / this.chunkSize); i++) {
      if (this.queue.length >= this.maxSize) {
        console.log("Overflow ending!");
        this.curIncomplete = chunk.slice(i * this.chunkSize);
        overflowed = true;
        break;
      }
      console.log("Pushed " + i);
      this.queue.push(
        chunk.slice(i * this.chunkSize, (i + 1) * this.chunkSize)
      );
    }
    console.log(this.queue.length);
    if (!overflowed) {
      console.log("Appending to incomplete");
      this.curIncomplete = chunk.slice(
        Math.floor(chunk.length / this.chunkSize) * this.chunkSize
      );
      done();
    } else {
      this.cbs.push(done);
    }
  }
  flushData() {
    //console.log(this.queue);
    if(this.shock){
      let timesToCallAgain = this.shock - 1;
      this.shock = null;
      for(let i = 0; i < timesToCallAgain; i ++){
        this.flushData();
      }
    }
    console.log("Flushing data");
    if (this.queue.length > 0) {
      let chunkFixedSize = this.queue.shift();
      console.log(typeof chunkFixedSize);
      console.log("Queue length ", this.queue.length);
      //console.log(chunkFixedSize);
      this.push(chunkFixedSize);
      this.onConsume();
    } else {
      if(this.cbs.length > 0){
        (this.cbs.shift())();
      }else{
        
      }
      console.log("queue empty")
    }
  }
  onConsume() {
    let chunk = this.curIncomplete;
    let overflowed = false;
    for (let i = 0; i < Math.floor(chunk.length / this.chunkSize); i++) {
      if (this.queue.length >= this.maxSize) {
        this.curIncomplete = chunk.slice(i * this.chunkSize);
        overflowed = true;
        break;
      }
      this.queue.push(
        chunk.slice(i * this.chunkSize, (i + 1) * this.chunkSize)
      );
    }
    if (!overflowed) {
      this.curIncomplete = this.curIncomplete.slice(
        Math.floor(this.curIncomplete.length / this.chunkSize) * this.chunkSize
      );
    }
  }
}
// Deprecated! Inefficent and laggy
class MultiWritable extends Writable {
  constructor(options) {
    super(options);
    this.consumers = [];
    this.sendbuffer = [];
    this.started = false;
  }
  thinkItIsDone() {
    console.log("Blank empty buffer func called");
    // Do nothing let user override
  }
  onExhaust() {
    console.log("Blank Exhaust Called");
    // Do nothing let user override
  }
  get empty() {
    return this.sendbuffer.length == 0;
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
    //console.log(data + " " + this.sendbuffer.length);
    if (data) {
      // Chunks in Queue!!!
      //console.log("We have chunks " + Object.keys(data));
      let { chunk, encoding, callback } = data;
      for (var i = 0; i < total; i++) {
        this.consumers[i].write(chunk, encoding, function() {
          count++;
          if (count == total && callback) {
            callback();
          }
        });
      }
    } else {
      this.thinkItIsDone();
    }
  }
  write(chunk, encoding, callback) {
    if (!this.started) {
      this.started = true;
      var scope = this;
      //console.log(chunk.length);
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
    console.log(
      "Queued Chunk " + this.sendbuffer.length + " chunk len " + chunk.length
    );
  }
}
module.exports = { MultiWritable: MultiWritable, SyncStream: SyncStream };
