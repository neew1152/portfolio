const canvas = document.getElementById('fluid-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let orbs = [];

const colors = [
    '#ff00ff', '#00ffff', '#0011ff', '#7000ff', '#ff0055', '#00ff99'
];

let mouse = { x: null, y: null };
let isHovering = false;

function resize() {
    width = canvas.width = window.innerWidth * 1.4;
    height = canvas.height = window.innerHeight * 1.4;
}

window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
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
    constructor(startImmediately = true) {
        this.init(startImmediately);
    }

    init(startImmediately) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        // SPEED INCREASED by 50% (was 1.5, now 2.25)
        this.vx = (Math.random() - 0.5) * 2.25; 
        this.vy = (Math.random() - 0.5) * 2.25;
        
        this.radius = Math.random() * 300 + 300; 
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // LIFECYCLE VARIABLES for Fading In/Out
        this.state = startImmediately ? 'stable' : 'fadingIn';
        this.opacity = startImmediately ? (Math.random() * 0.4 + 0.1) : 0;
        this.maxOpacity = Math.random() * 0.4 + 0.2; // How bright this orb gets
        
        this.lifeTime = 0;
        this.maxLife = Math.random() * 400 + 200; // How long it exists before disappearing
    }

    update() {
        // --- 1. Movement ---
        this.x += this.vx;
        this.y += this.vy;

        // Bounce
        if (this.x < -200 || this.x > width + 200) this.vx *= -1;
        if (this.y < -200 || this.y > height + 200) this.vy *= -1;

        // --- 2. Mouse Attraction ---
        if (isHovering && mouse.x != null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 1000) {
                const force = (1000 - distance) / 1000; 
                const pullStrength = 0.03 * force; 
                this.vx += (dx / distance) * pullStrength;
                this.vy += (dy / distance) * pullStrength;
            }
        }

        // Friction
        this.vx *= 0.98; 
        this.vy *= 0.98;

        // --- 3. Lifecycle (Disappear/Reappear Logic) ---
        if (this.state === 'fadingIn') {
            this.opacity += 0.005; // Fade in speed
            if (this.opacity >= this.maxOpacity) {
                this.opacity = this.maxOpacity;
                this.state = 'stable';
            }
        } else if (this.state === 'stable') {
            this.lifeTime++;
            if (this.lifeTime > this.maxLife) {
                this.state = 'fadingOut';
            }
        } else if (this.state === 'fadingOut') {
            this.opacity -= 0.005; // Fade out speed
            if (this.opacity <= 0) {
                // Once invisible, RESPAWN completely new
                this.init(false); 
            }
        }

        this.draw();
    }

    draw() {
        ctx.beginPath();
        const g = ctx.createRadialGradient(
            this.x, this.y, 0, 
            this.x, this.y, this.radius
        );
        // Use dynamic opacity variable
        g.addColorStop(0, this.hexToRgbA(this.color, this.opacity));
        g.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = g;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

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
        return hex;
    }
}

function initOrbs() {
    orbs = [];
    // Increase count slightly to account for some being invisible/fading
    const orbCount = window.innerWidth < 768 ? 8 : 15;
    
    for (let i = 0; i < orbCount; i++) {
        // Start some visible, some fading in for variety
        const startVisible = Math.random() > 0.5;
        orbs.push(new Orb(startVisible));
    }
}

initOrbs();

function animate() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'screen'; 
    orbs.forEach(orb => orb.update());
    requestAnimationFrame(animate);
}

animate();