function controllerclick(event) {
    console.log("Clicked");
    console.log(event);
  if(event.ctrlKey){
    $("#streamelem").toggle();
  }else{
    
  }
  }
$(function() {
  $("#streamelem").hide();
  let controller = document.getElementById("controller");
  controller.addEventListener("click", controllerclick);
});
function play(dest, elem){
  let audioelem = document.getElementById("streamelem");
  audioelem.src = dest;
  audioelem.play();
  let name = elem.parentElement.children[0].innerText;
  $("#station-name-display").text(name);
  console.log("Station Name is "+name);
}