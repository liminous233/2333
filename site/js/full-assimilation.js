/* The map alone dissolves at 100; an open story panel remains readable. */
(function () {
  var CC=window.CC;
  CC.fullAssimilation=function(root){
    var active=false,timer=0,targets=[],eyes=[],flowers=[],index=0,round=0;
    var reduced=CC.reducedMotion(), tiles=root.querySelector('.tiles');
    function stop(){
      clearTimeout(timer);active=false;document.body.classList.remove('full-assim-map');
      targets.forEach(function(el){el.classList.remove('assim-melting');el.style.removeProperty('--drip-delay');el.inert=false;});
      eyes.forEach(function(el){el.remove();});eyes=[];targets=[];index=round=0;
    }
    function grow(){
      if(!active)return;
      if(!document.hidden){
        round++;
        var amount=reduced?flowers.length:Math.min(1+Math.floor(round/2),flowers.length-index);
        for(var i=0;i<amount && index<flowers.length;i++,index++){
          var eye=document.createElement('i');eye.className='assim-flower-eye';eye.setAttribute('aria-hidden','true');
          eye.style.backgroundImage='url(assets/img/v02/full-eye-'+(1+index%4)+'.png)';
          eye.style.setProperty('--blink-time',(2.4+Math.random()*2.5)+'s');eye.style.animationDelay=(-Math.random()*2)+'s';
          flowers[index].appendChild(eye);eyes.push(eye);
        }
      }
      if(index<flowers.length)timer=setTimeout(grow,1700);
    }
    function start(){
      active=true;document.body.classList.add('full-assim-map');
      flowers=Array.from(tiles.querySelectorAll('.tile--flower'));
      var rand=CC.rng(1000110);
      for(var i=flowers.length-1;i>0;i--){var j=Math.floor(rand()*(i+1)),tmp=flowers[i];flowers[i]=flowers[j];flowers[j]=tmp;}
      flowers=flowers.slice(0,Math.floor(flowers.length/2));
      targets=Array.from(root.querySelectorAll('.tile:not(.tile--flower):not(.tile--moon),.room:not(.room--field):not(.room--cathedral),.welcome__zh,.welcome__en,.candle-btn,.v02-map-status'));
      ['#chrome','#leave','#music'].forEach(function(sel){var el=document.querySelector(sel);if(el)targets.push(el);});
      targets.forEach(function(el){el.style.setProperty('--drip-delay',(rand()*2.3)+'s');el.classList.add('assim-melting');if(el.matches('.room'))el.inert=true;});
      timer=setTimeout(grow,reduced?0:1500);
    }
    function check(){if(CC.state.assim===100){if(!active)start();}else if(active)stop();}
    document.addEventListener('cc:change',check);check();
    return function(){document.removeEventListener('cc:change',check);stop();};
  };
})();
