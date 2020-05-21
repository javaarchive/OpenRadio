// client-side js, loaded by index.html
// run by the browser each time the page is loaded

console.log("hello empowered world");
let dotsIter = 0;
const dotsAnimation = [".","..","..."]
setInterval(function(){
  $(".dots-animate").html(dotsAnimation[dotsIter % dotsAnimation.length])
  dotsIter = (dotsIter + 1) % dotsAnimation.length;
},500)