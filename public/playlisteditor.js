function deleteitem(pos,elem){
  console.log("Deleting ",pos);
  $("#del-number").val(pos);
  $("#playlist-item-delete-form").submit();
}
function moveUpItem(pos,elem){
  console.log("Deleting ",pos);
  $("#target-number").val(pos);
  $("#playlist-item-move-up").submit();
}
function moveDownItem(pos,elem){
  console.log("Deleting ",pos);
  $("#target-number").val(pos);
  $("#playlist-item-move-down").submit();
}