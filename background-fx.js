const canvas = document.getElementById('fluid-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let orbs = [];

// Cyber/Neon Palette
const colors = [
    '#ff00ff', // Neon Magenta
    '#00ffff', // Bright Cyan
    '#0011ff', // Electric Blue
    '#7000ff', // Deep Purple
    '#ff0055', // Hot Pink
    '#00ff99'  // Cyber Green
];

// Mouse State
let mouse = { x: null, y: null };
let isHovering = false;

function resize() {
    // Match the CSS overscan (140%)
    width = canvas.width = window.innerWidth * 1.4;
    height = canvas.height = window.innerHeight * 1.4;
}

window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
    // Offset mouse coords to match the -20% top/left CSS positioning
    mouse.x = e.clientX + (window.innerWidth * 0.2);
    mouse.y = e.clientY + (window.innerHeight * 0.2);
    isHovering = true;
});

window.addEventListener('mouseleave', () => {
    isHovering = false;
    mouse.x = null;
    mouse.y = null;
});

class Orb {
    constructor() {
        this.init();
    }

    init() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        // Very slow idle drift
        this.vx = (Math.random() - 0.5) * 1.5; 
        this.vy = (Math.random() - 0.5) * 1.5;
        
        // HUGE RADIUS = Soft Gradient Look
        this.radius = Math.random() * 300 + 300; 
        
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.angle = Math.random() * Math.PI * 2;
    }

    update() {
        // 1. Idle Movement
        this.x += this.vx;
        this.y += this.vy;

        // Soft bounce off edges
        if (this.x < -200 || this.x > width + 200) this.vx *= -1;
        if (this.y < -200 || this.y > height + 200) this.vy *= -1;

        // 2. Mouse Attraction (Slow & Smooth)
        if (isHovering && mouse.x != null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Large detection range for smooth gradient shifting
            if (distance < 1000) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (1000 - distance) / 1000; 
                
                // LOW pull strength for "Floating/Wavy" feel
                const pullStrength = 0.02 * force; 

                this.vx += forceDirectionX * pullStrength;
                this.vy += forceDirectionY * pullStrength;
            }
        }

        // Low friction = maintains momentum like a fluid
        this.vx *= 0.98; 
        this.vy *= 0.98;

        this.draw();
    }

    draw() {
        ctx.beginPath();
        // Gradient from color to transparent
        const g = ctx.createRadialGradient(
            this.x, this.y, 0, 
            this.x, this.y, this.radius
        );
        // Lower opacity (0.4) for better blending/layering
        g.addColorStop(0, this.hexToRgbA(this.color, 0.4));
        g.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = g;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    // Helper to convert Hex to RGBA for opacity control
    hexToRgbA(hex, alpha){
        var c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
        }
        return hex; // fallback
    }
}

function initOrbs() {
    orbs = [];
    // Fewer orbs because they are huge now
    const orbCount = window.innerWidth < 768 ? 6 : 10;
    for (let i = 0; i < orbCount; i++) {
        orbs.push(new Orb());
    }
}

initOrbs();

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // "screen" or "lighten" blends the colors smoothly
    ctx.globalCompositeOperation = 'screen'; 

    orbs.forEach(orb => orb.update());
    requestAnimationFrame(animate);
}

animate();