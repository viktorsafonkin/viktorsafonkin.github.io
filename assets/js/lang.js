(function(){var d=document.querySelector(".lang-dd");if(!d)return;var b=d.querySelector(".lang-btn"),l=d.querySelector(".lang-list");
function set(o){l.hidden=!o;b.setAttribute("aria-expanded",o?"true":"false");}
b.addEventListener("click",function(e){e.stopPropagation();set(l.hidden);if(!l.hidden){var c=l.querySelector('[aria-current]')||l.querySelector("a");c&&c.focus();}});
document.addEventListener("click",function(e){if(!d.contains(e.target))set(false);});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!l.hidden){set(false);b.focus();}});
l.addEventListener("keydown",function(e){var a=[].slice.call(l.querySelectorAll("a")),i=a.indexOf(document.activeElement);if(e.key==="ArrowDown"){e.preventDefault();a[(i+1)%a.length].focus();}if(e.key==="ArrowUp"){e.preventDefault();a[(i-1+a.length)%a.length].focus();}});
d.addEventListener("focusout",function(e){if(!d.contains(e.relatedTarget))set(false);});})();
