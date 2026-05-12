document.addEventListener('DOMContentLoaded', () => {

    // ---- 1. Mobile Nav ----
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('nav-links');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // ---- 2. Active Nav on Scroll ----
    const sections  = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-link');

    const activateNav = () => {
        const scrollY = window.scrollY + 120;
        sections.forEach(sec => {
            if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
                navAnchors.forEach(a => a.classList.remove('active'));
                const target = document.querySelector(`.nav-link[href="#${sec.id}"]`);
                if (target) target.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', activateNav);
    activateNav();

    // ---- 3. Scroll Reveal ----
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('active'); observer.unobserve(e.target); }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // ---- 4. Marquee Duplication ----
    document.querySelectorAll('.marquee-content').forEach(content => {
        const orig = content.innerHTML;
        content.innerHTML = orig + orig + orig + orig;
    });

    // ---- 5. Contact Form ----
    // const form = document.getElementById('contact-form');
    // if (form) {
    //     form.addEventListener('submit', e => {
    //         e.preventDefault();
    //         const btn  = form.querySelector('button[type=submit]');
    //         const orig = btn.innerHTML;
    //         btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    //         btn.disabled = true;
    //         setTimeout(() => {
    //             btn.innerHTML = orig;
    //             btn.disabled  = false;
    //             form.reset();
    //             const success = document.getElementById('form-success');
    //             success.classList.remove('hidden');
    //             setTimeout(() => success.classList.add('hidden'), 5000);
    //         }, 1500);
    //     });
    // }

    // ---- 6. Footer Year ----
    const yr = document.getElementById('current-year');
    if (yr) yr.textContent = new Date().getFullYear();

    // ---- 7. Three.js Starfield ----
    function initThreeJS() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas || !window.THREE) return;

        const scene    = new THREE.Scene();
        const camera   = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(innerWidth, innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Stars
        const count = 1200;
        const positions = new Float32Array(count * 3);
        const colors    = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i += 3) {
            positions[i]   = (Math.random() - 0.5) * 500;
            positions[i+1] = (Math.random() - 0.5) * 500;
            positions[i+2] = (Math.random() - 0.5) * 500;

            const r = Math.random();
            if      (r > 0.85) { colors[i] = 1.0;  colors[i+1] = 0.32; colors[i+2] = 0.18; } // Orange
            else if (r > 0.70) { colors[i] = 0.44; colors[i+1] = 0.26; colors[i+2] = 0.97; } // Purple
            else if (r > 0.58) { colors[i] = 0.13; colors[i+1] = 0.83; colors[i+2] = 0.93; } // Cyan
            else               { colors[i] = 1.0;  colors[i+1] = 1.0;  colors[i+2] = 1.0;  } // White
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

        const mat = new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true });
        const stars = new THREE.Points(geo, mat);
        scene.add(stars);

        // Neural Lattice (Lines connecting stars)
        const maxDist = 50;
        const lineIndices = [];
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < maxDist && Math.random() > 0.98) { // Only connect some to keep it clean
                    lineIndices.push(i, j);
                }
            }
        }

        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        lineGeo.setIndex(lineIndices);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending });
        const lattice = new THREE.LineSegments(lineGeo, lineMat);
        scene.add(lattice);

        // Data Core (Central Geometric Node)
        const coreGeo = new THREE.IcosahedronGeometry(15, 1);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xff512f, wireframe: true, transparent: true, opacity: 0.2 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(-80, 50, -100);
        scene.add(core);

        // --- Nebula Clouds ---
        const createNebula = (color, x, y, z) => {
            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 128;
            const context = canvas.getContext('2d');
            const grad = context.createRadialGradient(64, 64, 0, 64, 64, 64);
            grad.addColorStop(0, color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            context.fillStyle = grad;
            context.fillRect(0, 0, 128, 128);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending });
            const sprite = new THREE.Sprite(material);
            sprite.position.set(x, y, z);
            sprite.scale.set(300, 300, 1);
            return sprite;
        };

        const neb1 = createNebula('rgba(255, 81, 47, 0.4)', 150, 100, -200);
        const neb2 = createNebula('rgba(112, 66, 248, 0.4)', -150, -100, -250);
        const neb3 = createNebula('rgba(34, 211, 238, 0.3)', 0, 0, -300);
        scene.add(neb1, neb2, neb3);

        // Mouse Parallax
        let mouseX = 0, mouseY = 0;
        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) / 100;
            mouseY = (e.clientY - window.innerHeight / 2) / 100;
        });

        // Animate
        let frame = 0;
        const animate = () => {
            requestAnimationFrame(animate);
            frame++;
            
            // Rotation
            stars.rotation.y += 0.0003;
            stars.rotation.x += 0.0001;
            lattice.rotation.y += 0.0003;
            lattice.rotation.x += 0.0001;
            
            core.rotation.y -= 0.004;
            core.rotation.z += 0.002;
            
            // Smooth Parallax
            camera.position.x += (mouseX - camera.position.x) * 0.05;
            camera.position.y += (-mouseY - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            // Dynamic Pulse
            neb1.material.opacity = 0.15 + Math.sin(frame * 0.01) * 0.05;
            neb2.material.opacity = 0.15 + Math.cos(frame * 0.02) * 0.05;
            lineMat.opacity = 0.05 + Math.sin(frame * 0.03) * 0.05;
            coreMat.opacity = 0.1 + Math.sin(frame * 0.01) * 0.1;

            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = innerWidth / innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(innerWidth, innerHeight);
        });
    }

    setTimeout(initThreeJS, 200);

});
