function deleteitem(pos,elem){
  console.log("Deleting ",pos);
  $("#del-number").val(pos);
  $("#playlist-item-delete-form").submit();
}
function moveUpItem(pos,elem){
  let totalItems = $("#items-list")[0].children.length;
  if(parseInt(pos) == totalItems - 1){
    alert("You cannot move this item any higher");
    return;
  }
  $("#target-number-up").val(pos);
  $("#playlist-item-move-up").submit();
}
function moveDownItem(pos,elem){
  //alert("Down");
  if(parseInt(pos) == 0){
    alert("You cannot move this item any lower");
    return;
  }
  $("#target-number-down").val(pos);
  $("#playlist-item-move-down").submit();
  
}