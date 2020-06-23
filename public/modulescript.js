
// ButterChurn
// My failed attempt
var currentPreset = 0;
function enableButterchurn() {
  let audioContext = new AudioContext();
  let canvas = document.createElement("canvas");
  canvas.height = 600;
  canvas.width = 800;
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

  visualizer.connectAudio(gainNode);

  // load a preset

  const presets_obj = butterchurnPresets.getPresets();
  const presets = Object.values(presets_obj);
  const preset =
    presets["Flexi, martin + geiss - dedicated to the sherwin maxawow"];
//const chosenPresets = ["Flexi, martin + geiss - dedicated to the sherwin maxawow","$$$ Royal - Mashup (431)","$$$ Royal - Mashup (220)"]
  
    visualizer.loadPreset(presets[0], 2); // 2nd argument is the number of seconds to blend presets
 

  // resize visualizer

  visualizer.setRendererSize(1600, 1200);

  // render a frame

  visualizer.render();
  window.render = function(){
    visualizer.render();
    window.requestAnimationFrame(window.render);
  }
  window.document.body.addEventListener("keyup", function(e){
    console.info(e.keyCode);
    if(e.keyCode == 37){
      currentPreset = (currentPreset + presets.length - 1) % presets.length;
      visualizer.loadPreset(presets[currentPreset], 2);
    }else if(e.keyCode == 39){
      currentPreset = (currentPreset + presets.length + 1) % presets.length;
      visualizer.loadPreset(presets[currentPreset], 2);
    }
  })
  window.render();
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
