const canvas = document.getElementById('fluid-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let orbs = [];

// NEW: More Vibrant, Varied Colors (Cyberpunk Palette)
const colors = [
    '#ff00ff', // Neon Magenta
    '#00ffff', // Bright Cyan
    '#0011ff', // Electric Blue
    '#7000ff', // Deep Purple
    '#ff0055', // Hot Pink
    '#00ff99'  // Cyber Green (Accent)
];

// Mouse State
let mouse = { x: null, y: null };
let isHovering = false;

// Resize Handler
function resize() {
    // Canvas is now 120% of screen (defined in CSS), so we match that resolution
    width = canvas.width = window.innerWidth * 1.2;
    height = canvas.height = window.innerHeight * 1.2;
}

window.addEventListener('resize', resize);
resize();

// Mouse Event Listeners
window.addEventListener('mousemove', (e) => {
    // Offset mouse coordinates because canvas is shifted -10% top/left
    mouse.x = e.clientX + (window.innerWidth * 0.1);
    mouse.y = e.clientY + (window.innerHeight * 0.1);
    isHovering = true;
});

window.addEventListener('mouseleave', () => {
    isHovering = false;
    mouse.x = null;
    mouse.y = null;
});

// Orb Class
class Orb {
    constructor() {
        this.init();
    }

    init() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        // Idle wandering speed
        this.vx = (Math.random() - 0.5) * 4; 
        this.vy = (Math.random() - 0.5) * 4;
        
        // Size variation
        this.radius = Math.random() * 180 + 80; 
        
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = 0.02;
    }

    update() {
        // 1. Idle Movement
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges (keep them inside the canvas)
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Pulse Effect
        this.angle += this.angleSpeed;
        const pulse = Math.sin(this.angle) * 30;

        // 2. Mouse Attraction (The "Faster" Logic)
        if (isHovering && mouse.x != null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Detection range increased to 800px
            if (distance < 800) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                
                // Stronger force calculation
                const force = (800 - distance) / 800; 
                
                // INCREASED SPEED: Changed 0.05 to 0.45 for rapid snapping
                const pullStrength = 0.45 * force; 

                this.vx += forceDirectionX * pullStrength * 50; // *50 adds "Burst" speed
                this.vy += forceDirectionY * pullStrength * 50;
            }
        }

        // Friction: Determines how fast they slow down.
        // 0.90 = stops fast (snappy). 0.99 = slides like ice.
        this.vx *= 0.92; 
        this.vy *= 0.92;

        // Minimum movement check (prevents them from stopping completely)
        if (!isHovering) {
            if (Math.abs(this.vx) < 1) this.vx *= 1.05;
            if (Math.abs(this.vy) < 1) this.vy *= 1.05;
        }

        this.draw(pulse);
    }

    draw(pulse) {
        ctx.beginPath();
        // Gradient for soft edges
        const g = ctx.createRadialGradient(
            this.x, this.y, 0, 
            this.x, this.y, this.radius + pulse
        );
        // High opacity center for vibrant colors
        g.addColorStop(0, this.color);
        g.addColorStop(0.6, this.color); 
        g.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = g;
        ctx.arc(this.x, this.y, this.radius + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

// Initialization
function initOrbs() {
    orbs = [];
    // Increase count for more color density
    const orbCount = window.innerWidth < 768 ? 8 : 15;
    for (let i = 0; i < orbCount; i++) {
        orbs.push(new Orb());
    }
}

initOrbs();

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // "hard-light" or "screen" makes colors blend intensely
    ctx.globalCompositeOperation = 'screen'; 

    orbs.forEach(orb => orb.update());
    requestAnimationFrame(animate);
}

animate();