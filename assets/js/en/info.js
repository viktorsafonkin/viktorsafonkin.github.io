(function(){
  var D=window.INFO_DATA,md=document.getElementById("infoMd");if(!D||!md)return;
  var body=md.querySelector(".info-body"),last=null;
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  var ML=[["Erzia","https://erzia-museum.ru"],["MISP","https://mispxx-xxi.ru"],["Khanenko","https://khanenko.museum"],["Heylshof","https://www.heylshof.de"],["Russian Museum","https://rusmuseum.ru"]];function ven(m){for(var i=0;i<ML.length;i++)if(m.indexOf(ML[i][0])>-1)return'<a class="mlink" href="'+ML[i][1]+'" target="_blank" rel="noopener">'+esc(m)+"</a>";return esc(m);}
  function open(key,el){
    var x=D[key[0]][+key.slice(1)];if(!x)return;last=el;
    var meta=[x.venue,x.city,x.dates||x.year,x.awarded_by].filter(Boolean);
    var h='<p class="kicker">'+(key[0]=="e"?"Exhibition":"Award")+'</p><h3 id="infoT">'+esc(x.title)+'</h3>';
    h+='<ul class="info-meta">'+meta.map(function(m){return"<li>"+(m===x.venue?ven(m):esc(m))+"</li>";}).join("")+"</ul>";
    if(x.description_ru)h+='<p class="info-desc">'+esc(x.description_ru)+"</p>";
    if(x.photos&&x.photos.length){h+='<div class="info-gal">'+x.photos.map(function(p,i){return'<a href="'+p+'" target="_blank" rel="noopener"><img src="'+p+'" alt="'+esc(x.title)+', photo '+(i+1)+'" loading="lazy" decoding="async"></a>';}).join("")+"</div>";
      if(x.photo_credit)h+='<p class="info-credit">Photo: '+esc(x.photo_credit)+"</p>";}
    if(x.sources&&x.sources.length)h+='<p class="info-src">Sources: '+x.sources.map(function(u,i){var d=u.replace(/^https?:\/\/(www\.|m\.)?/,"").split("/")[0];return'<a href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(d)+"</a>";}).join(" · ")+"</p>";
    body.innerHTML=h;md.hidden=false;document.documentElement.style.overflow="hidden";md.querySelector(".info-x").focus();
  }
  function close(){md.hidden=true;document.documentElement.style.overflow="";if(last)last.focus();}
  document.querySelectorAll(".info-on").forEach(function(el){
    el.addEventListener("click",function(e){if(e.target.closest("a"))return;open(el.dataset.info,el);});
    el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();open(el.dataset.info,el);}});
  });
  md.addEventListener("click",function(e){if(e.target===md||e.target.closest(".info-x"))close();});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!md.hidden)close();});
})();
