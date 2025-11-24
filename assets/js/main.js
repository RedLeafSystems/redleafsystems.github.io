document.addEventListener('DOMContentLoaded',function(){
  // Set current year
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Nav toggle for small screens
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if(navToggle && mainNav){
    navToggle.addEventListener('click',()=>{
      const expanded = mainNav.style.display === 'block';
      mainNav.style.display = expanded ? '' : 'block';
      navToggle.setAttribute('aria-expanded', String(!expanded));
    });
  }

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',function(e){
      const target = this.getAttribute('href');
      if(target.length>1){
        e.preventDefault();
        const el = document.querySelector(target);
        if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });

  // Button ripple effect
  function createRipple(e){
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height) * 1.4;
    ripple.style.width = ripple.style.height = size + 'px';
    const x = e.clientX - rect.left - size/2;
    const y = e.clientY - rect.top - size/2;
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.transition = 'transform 550ms cubic-bezier(.2,.9,.2,1),opacity 550ms ease';
    btn.appendChild(ripple);
    requestAnimationFrame(()=>{
      ripple.style.transform = 'scale(1)';
      ripple.style.opacity = '0';
    });
    setTimeout(()=>{ try{ btn.removeChild(ripple); }catch(e){} }, 600);
  }

  document.querySelectorAll('.btn').forEach(b=>{
    b.addEventListener('click',createRipple);
  });

  // Cursor-following highlight for buttons
  // Only enable on devices that support hover & fine pointer (i.e., not touch/mobile)
  const supportsHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if(supportsHover){
    const cursor = document.createElement('div');
    cursor.className = 'cursor-highlight';
    document.body.appendChild(cursor);

    let targetX = -100, targetY = -100, currentX = -100, currentY = -100;
    function lerp(a,b,n){return (1-n)*a + n*b}
    let rafId = null;
    function animateCursor(){
      currentX = lerp(currentX, targetX, 0.18);
      currentY = lerp(currentY, targetY, 0.18);
      cursor.style.left = currentX + 'px';
      cursor.style.top = currentY + 'px';
      rafId = requestAnimationFrame(animateCursor);
    }
    rafId = requestAnimationFrame(animateCursor);

    document.querySelectorAll('.btn').forEach(b=>{
      b.addEventListener('mouseenter', function(e){
        cursor.classList.add('visible');
        targetX = e.clientX; targetY = e.clientY;
      });
      b.addEventListener('mousemove', function(e){
        targetX = e.clientX; targetY = e.clientY;
      });
      b.addEventListener('mouseleave', function(){
        cursor.classList.remove('visible');
      });
    });
  }

  // Page-load shimmer: create a sweep that runs once and removes itself
  (function runShimmerOnce(){
    try{
      const shimmer = document.createElement('div');
      shimmer.className = 'shimmer-layer';
      // Insert near top so it blends with content but doesn't block UI
      document.body.appendChild(shimmer);
      shimmer.addEventListener('animationend', ()=>{
        // give a small delay for polish, then remove
        setTimeout(()=>{ try{ shimmer.remove(); }catch(e){} }, 80);
      }, {once:true});
    }catch(e){/* no-op if DOM not ready or other error */}
  })();

  // Photo carousel: expand images into a lightbox with smooth transition and add navigation arrows
  (function setupCarouselLightbox(){
    const imgs = Array.from(document.querySelectorAll('.carousel-item img'));
    const track = document.querySelector('.carousel-track');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');

    // scroll amount (one item width + gap) fallback
    function scrollAmount(){
      const item = document.querySelector('.carousel-item');
      if(!item) return Math.floor(window.innerWidth * 0.6);
      const style = window.getComputedStyle(item);
      const gap = 12; // matches css gap
      return Math.round(item.getBoundingClientRect().width + gap);
    }

    if(prevBtn && track){
      prevBtn.addEventListener('click', ()=>{ track.scrollBy({left: -scrollAmount(), behavior:'smooth'}); });
    }
    if(nextBtn && track){
      nextBtn.addEventListener('click', ()=>{ track.scrollBy({left: scrollAmount(), behavior:'smooth'}); });
    }

    let currentIndex = 0;

    function openLightbox(index){
      if(document.querySelector('.lb-overlay')) return;
      currentIndex = index;
      const imgEl = imgs[currentIndex];
      const src = imgEl.currentSrc || imgEl.src;
      const rect = imgEl.getBoundingClientRect();

      const overlay = document.createElement('div'); overlay.className = 'lb-overlay';
      const lb = document.createElement('div'); lb.className = 'lb-image';
      // inner wrapper holds current and incoming images for slide transitions
      const lbInner = document.createElement('div'); lbInner.className = 'lb-inner';
      let currentImg = document.createElement('img'); currentImg.src = src; currentImg.alt = imgEl.alt || '';
      currentImg.style.transform = 'translateX(0)';
      lbInner.appendChild(currentImg);
      lb.appendChild(lbInner);

      const closeBtn = document.createElement('button'); closeBtn.className = 'lb-close'; closeBtn.type = 'button'; closeBtn.title = 'Close'; closeBtn.textContent = '✕';
      const prevNav = document.createElement('button'); prevNav.className = 'lb-prev'; prevNav.type = 'button'; prevNav.title = 'Previous'; prevNav.textContent = '‹';
      const nextNav = document.createElement('button'); nextNav.className = 'lb-next'; nextNav.type = 'button'; nextNav.title = 'Next'; nextNav.textContent = '›';

      document.body.appendChild(overlay);
      document.body.appendChild(lb);
      document.body.appendChild(closeBtn);
      document.body.appendChild(prevNav);
      document.body.appendChild(nextNav);

      // set starting position to match thumbnail
      lb.style.left = rect.left + 'px';
      lb.style.top = rect.top + 'px';
      lb.style.width = rect.width + 'px';
      lb.style.height = rect.height + 'px';
      lb.style.borderRadius = window.getComputedStyle(imgEl).borderRadius || '8px';

      // show overlay
      void overlay.offsetWidth; overlay.classList.add('visible');

      // compute and animate to centered size when natural image loads
      const imgNatural = new Image(); imgNatural.src = src;
      imgNatural.onload = function(){
        const maxW = Math.floor(window.innerWidth * 0.92);
        const maxH = Math.floor(window.innerHeight * 0.86);
        const ratio = imgNatural.naturalWidth / imgNatural.naturalHeight;
        let targetW = maxW; let targetH = Math.round(targetW / ratio);
        if(targetH > maxH){ targetH = maxH; targetW = Math.round(targetH * ratio); }
        const left = Math.round((window.innerWidth - targetW)/2);
        const top = Math.round((window.innerHeight - targetH)/2);

        lb.style.transition = 'left 420ms cubic-bezier(.2,.9,.2,1), top 420ms cubic-bezier(.2,.9,.2,1), width 420ms cubic-bezier(.2,.9,.2,1), height 420ms cubic-bezier(.2,.9,.2,1), border-radius 320ms ease';
        requestAnimationFrame(()=>{
          requestAnimationFrame(()=>{
            lb.style.left = left + 'px'; lb.style.top = top + 'px'; lb.style.width = targetW + 'px'; lb.style.height = targetH + 'px'; lb.style.borderRadius = '12px';
          });
        });
        // ensure current image is visible after resize
        currentImg.style.transform = 'translateX(0)';
      };

      function removeLightbox(){
        try{ overlay.remove(); lb.remove(); closeBtn.remove(); prevNav.remove(); nextNav.remove(); }catch(e){}
        document.removeEventListener('keydown', onKey);
      }

      function close(){
        const r = imgs[currentIndex].getBoundingClientRect();
        lb.style.left = r.left + 'px'; lb.style.top = r.top + 'px'; lb.style.width = r.width + 'px'; lb.style.height = r.height + 'px';
        overlay.classList.remove('visible');
        setTimeout(removeLightbox, 480);
      }

      function showIndex(newIndex){
        // wrap index
        if(newIndex < 0) newIndex = imgs.length - 1;
        if(newIndex >= imgs.length) newIndex = 0;
        if(newIndex === currentIndex) return;

        const direction = (newIndex > currentIndex || (currentIndex === imgs.length - 1 && newIndex === 0)) ? 1 : -1;
        const newSrc = imgs[newIndex].currentSrc || imgs[newIndex].src;
        const incoming = document.createElement('img'); incoming.src = newSrc; incoming.alt = imgs[newIndex].alt || '';
        // position incoming offscreen depending on direction
        incoming.style.transform = `translateX(${direction > 0 ? 100 : -100}%)`;
        lbInner.appendChild(incoming);

        // when incoming is loaded, compute new container size and animate
        incoming.onload = function(){
          const nat = {w: incoming.naturalWidth, h: incoming.naturalHeight};
          const maxW = Math.floor(window.innerWidth * 0.92);
          const maxH = Math.floor(window.innerHeight * 0.86);
          let targetW = maxW; let targetH = Math.round(targetW / (nat.w / nat.h));
          if(targetH > maxH){ targetH = maxH; targetW = Math.round(targetH * (nat.w / nat.h)); }
          const left = Math.round((window.innerWidth - targetW)/2);
          const top = Math.round((window.innerHeight - targetH)/2);

          // animate container size/position
          lb.style.left = left + 'px'; lb.style.top = top + 'px'; lb.style.width = targetW + 'px'; lb.style.height = targetH + 'px';

          // slide current out and incoming in
          requestAnimationFrame(()=>{
            requestAnimationFrame(()=>{
              // move current opposite direction
              currentImg.style.transition = 'transform 360ms cubic-bezier(.2,.9,.2,1)';
              incoming.style.transition = 'transform 360ms cubic-bezier(.2,.9,.2,1)';
              currentImg.style.transform = `translateX(${direction > 0 ? -100 : 100}%)`;
              incoming.style.transform = 'translateX(0%)';
            });
          });

          // after transition, remove the previous outgoing image and keep incoming as currentImg
          const outgoing = currentImg;
          incoming.addEventListener('transitionend', function te(){
            incoming.removeEventListener('transitionend', te);
            try{ if(outgoing && outgoing.parentNode === lbInner) lbInner.removeChild(outgoing); }catch(e){}
            // ensure currentImg points to the visible image
            currentImg = incoming;
          });
          currentIndex = newIndex;
        };
      }

      function prev(){ showIndex(currentIndex - 1); }
      function next(){ showIndex(currentIndex + 1); }

      function onKey(e){ if(e.key === 'Escape') close(); if(e.key === 'ArrowLeft') prev(); if(e.key === 'ArrowRight') next(); }
      overlay.addEventListener('click', function(e){ if(e.target === overlay) close(); });
      closeBtn.addEventListener('click', close);
      prevNav.addEventListener('click', prev);
      nextNav.addEventListener('click', next);
      document.addEventListener('keydown', onKey);
    }

    // wire thumbnails
    imgs.forEach((img, i)=>{ img.style.cursor = 'zoom-in'; img.addEventListener('click', ()=> openLightbox(i)); });
  })();
});
