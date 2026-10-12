/* The map alone dissolves at 100; an open story panel remains readable. */
(function () {
  var CC=window.CC;
  CC.fullAssimilation=function(root){
    var active=false,timer=0,halfTimer=0,half=false,defs=null,targets=[],eyes=[],flowers=[],index=0,round=0;
    var reduced=CC.reducedMotion(), tiles=root.querySelector('.tiles');
    function stop(){
      clearTimeout(timer);clearTimeout(halfTimer);active=false;half=false;document.body.classList.remove('full-assim-map','has-assim-surrender');document.body.style.removeProperty('--assim-cutout');
      if(defs){defs.remove();defs=null;}
      root.querySelectorAll('.is-assim-surrender').forEach(function(el){el.classList.remove('is-assim-surrender');});
      targets.forEach(function(el){el.classList.remove('assim-melting');el.style.removeProperty('--drip-delay');el.style.removeProperty('--melt-drift');el.inert=false;});
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
      defs=document.createElement('div');defs.className='v02-chat-melt-defs';
      defs.innerHTML='<svg width="0" height="0" aria-hidden="true"><filter id="mapSlowMelt" x="-100%" y="-30%" width="300%" height="600%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.026" numOctaves="2" seed="11" result="n"><animate attributeName="baseFrequency" dur="24s" values="0.012 0.026;0.018 0.018;0.01 0.035" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"><animate attributeName="scale" dur="24s" values="0;12;34" fill="freeze"/></feDisplacementMap></filter></svg>';
      root.appendChild(defs);
      flowers=Array.from(tiles.querySelectorAll('.tile--flower'));
      var rand=CC.rng(1000110);
      for(var i=flowers.length-1;i>0;i--){var j=Math.floor(rand()*(i+1)),tmp=flowers[i];flowers[i]=flowers[j];flowers[j]=tmp;}
      flowers=flowers.slice(0,Math.floor(flowers.length/2));
      targets=Array.from(root.querySelectorAll('.tile:not(.tile--flower):not(.tile--moon),.room:not(.room--field):not(.room--cathedral),.welcome__zh,.welcome__en,.candle-btn,.v02-map-status'));
      ['#chrome','#leave','#music'].forEach(function(sel){var el=document.querySelector(sel);if(el)targets.push(el);});
      targets.forEach(function(el){el.style.setProperty('--drip-delay',(rand()*2.3)+'s');el.style.setProperty('--melt-drift',(rand()*30-15)+'px');el.classList.add('assim-melting');if(el.matches('.room'))el.inert=true;});
      timer=setTimeout(grow,reduced?0:1500);
      halfTimer=setTimeout(function(){half=true;portrait();},reduced?0:13000);
    }
    function cutout(){
      var panel=root.querySelector('.is-assim-surrender:not(.is-leaving)');
      document.body.classList.toggle('has-assim-surrender',!!panel);
      if(!panel)return;
      var r=panel.getBoundingClientRect(),x=r.left+'px',y=r.top+'px',right=r.right+'px',bottom=r.bottom+'px';
      document.body.style.setProperty('--assim-cutout','polygon(evenodd,0 0,100% 0,100% 100%,0 100%,0 0,'+x+' '+y+','+x+' '+bottom+','+right+' '+bottom+','+right+' '+y+','+x+' '+y+')');
    }
    function portrait(){if(active&&half)root.querySelectorAll('.is-c2-portrait:not(.is-leaving)').forEach(function(el){el.classList.add('is-assim-surrender');});cutout();}
    var observer=new MutationObserver(portrait);observer.observe(root,{childList:true,subtree:true});
    var sizing=new ResizeObserver(cutout);sizing.observe(root.querySelector('.map-panel-dock'));
    window.addEventListener('scroll',cutout,true);window.addEventListener('resize',cutout);
    function check(){if(CC.state.assim===100){if(!active)start();}else if(active)stop();}
    document.addEventListener('cc:change',check);check();
    return function(){document.removeEventListener('cc:change',check);observer.disconnect();sizing.disconnect();window.removeEventListener('scroll',cutout,true);window.removeEventListener('resize',cutout);stop();};
  };
})();
