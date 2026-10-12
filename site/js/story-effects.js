/* Scoped visual additions: downward ink, hymn grain, and the black-sun arc. */
(function () {
  var CC = window.CC;
  function downflow(root) {
    if (CC.reducedMotion() || CC.story.route()==='REPORT_BLACK') return function () {};
    var defs=document.createElement('div');defs.className='v02-chat-melt-defs';
    defs.innerHTML='<svg width="0" height="0" aria-hidden="true"><filter id="chatLetterMelt" x="-15%" y="-25%" width="130%" height="650%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="2" seed="7" result="n"><animate attributeName="baseFrequency" dur="9s" values="0.012 0.09;0.016 0.05;0.012 0.09" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G"/></filter></svg>';
    root.appendChild(defs);
    function prepare(bubble) {
      if (bubble.dataset.letterMelt) return;
      bubble.dataset.letterMelt='true';
      var text=bubble.querySelector('.v02-chat-text');
      if(!text){text=document.createElement('span');text.className='v02-chat-text';text.textContent=bubble.textContent;bubble.replaceChildren(text);}
      var value=text.textContent;
      if(!value.trim()){bubble.classList.add('v02-empty-melt');return;}
      bubble.setAttribute('aria-label',value);text.setAttribute('aria-hidden','true');text.classList.add('v02-melt-letters');
      var rand=CC.rng(value.length+110);
      text.innerHTML=Array.from(value).map(function(ch){return '<span style="--dur:'+(8+rand()*3).toFixed(2)+'s;--delay:'+(rand()*.7).toFixed(2)+'s;--fall:'+(65+rand()*55).toFixed(0)+'px;--stretch:'+(1.6+rand()).toFixed(2)+';--drift:'+(rand()*6-3).toFixed(2)+'px">'+CC.esc(ch)+'</span>';}).join('');
    }
    function scan(){if(CC.story.route()==='REPORT_BLACK')return;root.querySelectorAll('.v02-liquid').forEach(prepare);}
    function enter(e){if(CC.story.route()==='REPORT_BLACK')return;var b=e.target.closest('.bub--wei,.map-chat--blue');if(b&&root.contains(b)){prepare(b);b.classList.add('v02-text-flow');}}
    function leave(e){var b=e.target.closest('.bub--wei,.map-chat--blue');if(b&&(!e.relatedTarget||!b.contains(e.relatedTarget)))b.classList.remove('v02-text-flow');}
    var observer=new MutationObserver(scan);observer.observe(root,{childList:true,subtree:true});scan();
    root.addEventListener('pointerover',enter);root.addEventListener('pointerout',leave);root.addEventListener('focusin',enter);root.addEventListener('focusout',leave);
    return function(){observer.disconnect();defs.remove();root.removeEventListener('pointerover',enter);root.removeEventListener('pointerout',leave);root.removeEventListener('focusin',enter);root.removeEventListener('focusout',leave);};
  }
  function mapPanelLayout(root) {
    var dock=root.querySelector('.map-panel-dock'), pending=0;
    function schedule(){if(!pending)pending=requestAnimationFrame(fit);}
    function fit(){
      pending=0;
      dock.querySelectorAll('.map-panel:not(.is-leaving)').forEach(function(panel){
        if(innerWidth<=860){panel.style.removeProperty('--map-image-height');return;}
        var fig=panel.querySelector('.map-panel__fig');if(!fig)return;
        // Use document position, so scrolling does not change image size.
        var top=dock.getBoundingClientRect().top+scrollY;
        var below=panel.offsetHeight-fig.offsetHeight;
        var height=Math.max(140,Math.floor(innerHeight-top-below-30))+'px';
        if(panel.style.getPropertyValue('--map-image-height')!==height)panel.style.setProperty('--map-image-height',height);
      });
    }
    var resize=new ResizeObserver(schedule);resize.observe(root.querySelector('.grounds__welcome'));
    function watch(){resize.disconnect();resize.observe(root.querySelector('.grounds__welcome'));dock.querySelectorAll('.map-panel').forEach(function(panel){resize.observe(panel);});schedule();}
    var mutation=new MutationObserver(watch);mutation.observe(dock,{childList:true});
    dock.addEventListener('load',schedule,true);window.addEventListener('resize',schedule);watch();
    return function(){cancelAnimationFrame(pending);resize.disconnect();mutation.disconnect();dock.removeEventListener('load',schedule,true);window.removeEventListener('resize',schedule);};
  }
  function noise(root) {
    var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
    canvas.className = 'v02-hymn-noise'; canvas.setAttribute('aria-hidden', 'true'); root.appendChild(canvas);
    var tile = document.createElement('canvas'); tile.width = tile.height = 192;
    var tc = tile.getContext('2d'), pixels = tc.createImageData(192, 192), raf = 0, last = -100;
    function size() { canvas.width = root.clientWidth; canvas.height = root.clientHeight; }
    function draw(t) {
      if (t - last > 50 && !document.hidden) {
        last = t;
        for (var i = 0; i < pixels.data.length; i += 4) { var c = Math.random() * 255; pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = c; pixels.data[i + 3] = 255; }
        tc.putImageData(pixels, 0, 0); ctx.fillStyle = ctx.createPattern(tile, 'repeat'); ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      if (!CC.reducedMotion()) raf = requestAnimationFrame(draw);
    }
    size(); draw(0); window.addEventListener('resize', size);
    return function () { cancelAnimationFrame(raf); window.removeEventListener('resize', size); canvas.remove(); };
  }
  function sunArc(root) {
    var area = root.querySelector('.cover__right'), img = root.querySelector('.bsun img'), tabs = Array.from(root.querySelectorAll('.tab'));
    function place() {
      if (!img.naturalWidth) return;
      var w = area.clientWidth, h = area.clientHeight, scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      var iw = img.naturalWidth * scale, ih = img.naturalHeight * scale;
      var cx = w / 2, cy = ih / 2 + (h - ih) * .52, radius = iw * .17;
      tabs.forEach(function (tab, i) {
        var head = tab.querySelector('.tab__head'), tw = head.offsetWidth, th = head.offsetHeight;
        var a = (tabs.length === 5 ? [-85, -43, 0, 43, 85] : [-68, -23, 23, 68])[i] * Math.PI / 180;
        var r = radius + tw / 2 + 16;
        tab.style.left = Math.max(12, Math.min(w - tw - 12, cx + Math.cos(a) * r - tw / 2)) + 'px';
        tab.style.top = Math.max(20, Math.min(h - th - 90, cy + Math.sin(a) * r - th / 2)) + 'px';
          if (tab.dataset.tab === 'endings') {
            var panelWidth = Math.min(290, innerWidth * .8), left = parseFloat(tab.style.left);
            tab.style.setProperty('--stats-left', (Math.max(12, Math.min(w - panelWidth - 12, left + tw - panelWidth)) - left) + 'px');
          }
      });
    }
    var observer = new ResizeObserver(place); observer.observe(area); img.addEventListener('load', place); place();
    return function () { observer.disconnect(); img.removeEventListener('load', place); };
  }
  CC.storyEffects = { downflow: downflow, noise: noise, sunArc: sunArc, mapPanelLayout: mapPanelLayout };
})();
