
// ButterChurn
// My failed attempt

function enableButterchurn() {
  let audioContext = new AudioContext();
  let canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  let audio = document.getElementById("streamelem");
  const gainNode = new AnalyserNode(audioContext, {
    fftSize: 2048,
    smoothingTimeConstant: 0.5
  })
  //let gainNode = audioContext.createGain();
  var src = audioContext.createMediaElementSource(audio);
  gainNode.connect(audioContext.destination);
  src.connect(gainNode);
  //console.log(butterchurn.default);
  const visualizer = butterchurn.default.createVisualizer(
    audioContext,
    canvas,
    {
      width: 800,
      height: 600
    }
  );
console.log("No errors I guess");
  // get audioNode from audio source or microphone

  visualizer.connectAudio(src);

  // load a preset

  const presets = butterchurnPresets.getPresets();
  const preset =
    presets["Flexi, martin + geiss - dedicated to the sherwin maxawow"];

  visualizer.loadPreset(preset, 0.0); // 2nd argument is the number of seconds to blend presets

  // resize visualizer

  visualizer.setRendererSize(1600, 1200);

  // render a frame

  visualizer.render();
}
var khistory = "";
function KeyPress(e) {
  var keynum;

  if (window.event) {
    // IE
    keynum = e.keyCode;
  } else if (e.which) {
    // Netscape/Firefox/Opera
    keynum = e.which;
  }

  khistory += String.fromCharCode(keynum);
  console.log(khistory);
  khistory = khistory.toLowerCase();
  if (khistory.includes("milkdrop")) {
    enableButterchurn();
    khistory = "";
  } else {
  }
}
window.KeyPress = KeyPress;
