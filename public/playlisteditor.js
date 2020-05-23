function deleteitem(pos,elem){
  console.log("Deleting ",pos);
  $("#del-number").val(pos);
  $("#playlist-item-delete-form").submit();
}