// deprectaed bundler version

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function controllerclick(event) {
  console.log("Clicked");
  console.log(event);
  if (event.ctrlKey) {
    $("#streamelem").toggle();
  } else {
  }
}
$(function() {
  $("#streamelem").hide();
  let controller = document.getElementById("controller");
  controller.addEventListener("click", controllerclick);
  document.body.onkeyup = KeyPress;
});
function play(dest, elem) {
  let audioelem = document.getElementById("streamelem");
  audioelem.src = dest;
  audioelem.play();
  //console.log(elem);
  //console.log(elem.parentElement.children[0]);
  let name = elem.parentElement.innerText;
  $("#station-name-display").text(name);
  console.log("Station Name is " + name);
}
// ButterChun

function enableButterchurn() {
  let audioContext = new AudioContext();
  let canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  let audio = document.getElementById("streamelem");
  const analyserNode = new AnalyserNode(audioContext, {
    fftSize: 2048,
    smoothingTimeConstant: 0.5
  });
  var src = audioContext.createMediaElementSource(audio);
  src.connect(analyserNode);
  console.log(butterchurn);
  const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
    width: 800,
    height: 600
  });

  // get audioNode from audio source or microphone

  visualizer.connectAudio(anaylserNode);

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

},{}]},{},[1]);
