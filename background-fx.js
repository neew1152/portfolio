const canvas = document.getElementById('fluid-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let orbs = [];

// Cyber Blue Palette (Dark to Light)
const colors = [
    '#001133', // Deep Blue
    '#003366', // Mid Blue
    '#005f73', // Teal Dark
    '#0a9396', // Teal Light
    '#001524'  // Almost Black Blue
];

// Mouse State
let mouse = { x: null, y: null };
let isHovering = false;

// Resize Handler
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

// Mouse Event Listeners
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
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
        // Random position
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        // Base Velocity for "Wavy" continuous movement
        this.vx = (Math.random() - 0.5) * 2; // Speed between -1 and 1
        this.vy = (Math.random() - 0.5) * 2;
        
        // Appearance
        this.radius = Math.random() * 150 + 100; // Large blobs
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Sine wave offset for pulsing
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = 0.02;
    }

    update() {
        // 1. Continuous Wavy Movement (Idle State)
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < -100 || this.x > width + 100) this.vx *= -1;
        if (this.y < -100 || this.y > height + 100) this.vy *= -1;

        // Pulse size slightly for "breathing" effect
        this.angle += this.angleSpeed;
        const pulse = Math.sin(this.angle) * 20;

        // 2. Mouse Attraction (Hover State)
        if (isHovering && mouse.x != null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If mouse is somewhat close (within 600px)
            if (distance < 600) {
                // Calculate force - closer = stronger pull
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (600 - distance) / 600; 
                
                // Gentler pull factor (0.05) so it feels fluid, not jerky
                const pullStrength = 0.05 * force; 

                this.vx += forceDirectionX * pullStrength;
                this.vy += forceDirectionY * pullStrength;
            }
        }

        // Apply friction to prevent them from getting too fast
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Keep a minimum movement speed so it never freezes
        if (!isHovering) {
            if (Math.abs(this.vx) < 0.5) this.vx *= 1.05;
            if (Math.abs(this.vy) < 0.5) this.vy *= 1.05;
        }

        this.draw(pulse);
    }

    draw(pulse) {
        ctx.beginPath();
        // Create gradient for soft orb look
        const g = ctx.createRadialGradient(
            this.x, this.y, 0, 
            this.x, this.y, this.radius + pulse
        );
        g.addColorStop(0, this.color);
        g.addColorStop(1, 'rgba(0,0,0,0)'); // Fade to transparent

        ctx.fillStyle = g;
        // Draw slightly larger than radius to account for gradient fade
        ctx.arc(this.x, this.y, this.radius + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

// Create Orbs
function initOrbs() {
    orbs = [];
    // Number of orbs based on screen size (prevent overcrowding on mobile)
    const orbCount = window.innerWidth < 768 ? 5 : 12;
    for (let i = 0; i < orbCount; i++) {
        orbs.push(new Orb());
    }
}

initOrbs();

// Main Animation Loop
function animate() {
    // Clear canvas with a slight trail effect (optional, or just clearRect)
    ctx.clearRect(0, 0, width, height);
    
    // Use "screen" blend mode for glowing effect
    ctx.globalCompositeOperation = 'screen';

    orbs.forEach(orb => orb.update());

    requestAnimationFrame(animate);
}

animate();