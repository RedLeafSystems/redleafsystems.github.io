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

if (!isMobile) {
    document.querySelectorAll('a').forEach(link => {

        // USE TRY-CATCH
        try {
            if (urlExists("sounds/click.mp3") && urlExists("sounds/unclick.mp3")) {
                link.addEventListener('mousedown', () => playSound('sounds/click.mp3'));
                link.addEventListener('mouseup', () => playSound('sounds/unclick.mp3'));
            }
            else {
                link.addEventListener('mousedown', () => playSound('../sounds/click.mp3'));
                link.addEventListener('mouseup', () => playSound('../sounds/unclick.mp3'));
            }
        } catch (error) {
            console.error("Error checking sound files:", error);
        }
        
        if (urlExists("sounds/click.mp3") && urlExists("sounds/unclick.mp3")) {
            link.addEventListener('mousedown', () => playSound('sounds/click.mp3'));
            link.addEventListener('mouseup', () => playSound('sounds/unclick.mp3'));
        }
        else {
            link.addEventListener('mousedown', () => playSound('../sounds/click.mp3'));
            link.addEventListener('mouseup', () => playSound('../sounds/unclick.mp3'));
        }
    });
}



// Utility functions
async function urlExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok; // true if status is 200–299
    } catch (err) {
        console.error("Error checking URL:", err);
        return false;
    }
}