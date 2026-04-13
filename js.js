document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.href;

        document.body.style.transition = 'opacity 0.7s ease-in-out';
        document.body.style.opacity = '0';

        setTimeout(() => {
            window.location.href = href;
        }, 700); // match your transition duration
    });
});

window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
        document.body.style.transition = '';
        document.body.style.opacity = '0';

        requestAnimationFrame(() => {
            document.body.style.transition = 'opacity 0.7s ease-in-out';
            document.body.style.opacity = '1';
        });
    }
});




// Sounds!!
function playSound(src) {
    const audio = new Audio(src);
    audio.play();
}

// Button sounds
const isMobile = window.matchMedia('(pointer: coarse)').matches;

if (isMobile) {
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('touchstart', () => playSound('sounds/mobile-click.mp3'), { passive: true });
    });
}
else {
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('mousedown', () => playSound('sounds/click.mp3'));
        link.addEventListener('mouseup', () => playSound('sounds/unclick.mp3'));
    });
}