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
