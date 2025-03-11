export function initBackground() {
    function createStar() {
        const star = document.createElement("div");
        star.classList.add("star");
        document.body.appendChild(star);
        const baseX = Math.random() * window.innerWidth;
        const baseY = Math.random() * window.innerHeight * 2;
        star.style.left = baseX + "px";
        star.style.top = baseY + "px";
        star.style.animationDuration = (Math.random() * 5 + 5) + "s";
        star.dataset.baseX = baseX;
        star.dataset.baseY = baseY;
        return star;
    }

    function createPlanet() {
        const planet = document.createElement("div");
        planet.classList.add("planet");
        document.body.appendChild(planet);
        const size = Math.random() * 15 + 8;
        const baseX = Math.random() * window.innerWidth;
        const baseY = Math.random() * window.innerHeight * 2;
        planet.style.width = size + "px";
        planet.style.height = size + "px";
        planet.style.left = baseX + "px";
        planet.style.top = baseY + "px";
        planet.dataset.baseX = baseX;
        planet.dataset.baseY = baseY;

        const colors = [
            "radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, rgba(74, 144, 226, 0.7) 40%, rgba(26, 35, 126, 0.5) 70%, transparent 100%)",
            "radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, rgba(255, 255, 255, 0.7) 40%, rgba(200, 200, 200, 0.5) 70%, transparent 100%)",
            "radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, rgba(150, 150, 150, 0.7) 40%, rgba(100, 100, 100, 0.5) 70%, transparent 100%)"
        ];
        planet.style.background = colors[Math.floor(Math.random() * colors.length)];

        if (Math.random() > 0.7) {
            planet.classList.add("ringed");
        }
        return planet;
    }

    const stars = [];
    const planets = [];

    for (let i = 0; i < 100; i++) stars.push(createStar());
    for (let i = 0; i < 15; i++) planets.push(createPlanet());

    return { stars, planets };
}

export function animateBackground(stars, planets, dynamicElements = {}) {
    function updatePositions(mouseX, mouseY) {
        stars.forEach(star => {
            const baseX = parseFloat(star.dataset.baseX);
            const baseY = parseFloat(star.dataset.baseY);
            const randomDx = parseFloat(star.dataset.randomX) || 0;
            const randomDy = parseFloat(star.dataset.randomY) || 0;
            const mouseDx = mouseX !== null ? (mouseX - baseX) * 0.05 : 0;
            const mouseDy = mouseY !== null ? (mouseY - baseY) * 0.05 : 0;
            star.style.left = (baseX + randomDx + mouseDx) + "px";
            star.style.top = (baseY + randomDy + mouseDy - window.scrollY * 0.1) + "px";
        });

        planets.forEach(planet => {
            const baseX = parseFloat(planet.dataset.baseX);
            const baseY = parseFloat(planet.dataset.baseY);
            const randomDx = parseFloat(planet.dataset.randomX) || 0;
            const randomDy = parseFloat(planet.dataset.randomY) || 0;
            const mouseDx = mouseX !== null ? (mouseX - baseX) * 0.03 : 0;
            const mouseDy = mouseY !== null ? (mouseY - baseY) * 0.03 : 0;
            planet.style.left = (baseX + randomDx + mouseDx) + "px";
            planet.style.top = (baseY + randomDy + mouseDy - window.scrollY * 0.2) + "px";
        });

        if (dynamicElements.introText) {
            const baseX = parseFloat(dynamicElements.introText.dataset.baseX);
            const baseY = parseFloat(dynamicElements.introText.dataset.baseY);
            const randomDx = parseFloat(dynamicElements.introText.dataset.randomX) || 0;
            const randomDy = parseFloat(dynamicElements.introText.dataset.randomY) || 0;
            const mouseDx = mouseX !== null ? (mouseX - baseX - dynamicElements.introText.offsetWidth / 2) * 0.02 : 0;
            const mouseDy = mouseY !== null ? (mouseY - baseY - dynamicElements.introText.offsetHeight / 2) * 0.02 : 0;
            dynamicElements.introText.style.left = (baseX + randomDx + mouseDx) + "px";
            dynamicElements.introText.style.top = (baseY + randomDy + mouseDy - window.scrollY * 0.05) + "px";
        }

        if (dynamicElements.introVideo) {
            const baseX = parseFloat(dynamicElements.introVideo.dataset.baseX);
            const baseY = parseFloat(dynamicElements.introVideo.dataset.baseY);
            const randomDx = parseFloat(dynamicElements.introVideo.dataset.randomX) || 0;
            const randomDy = parseFloat(dynamicElements.introVideo.dataset.randomY) || 0;
            const mouseDx = mouseX !== null ? (mouseX - baseX - (window.innerWidth * 0.9) / 2) * 0.05 : 0;
            const mouseDy = mouseY !== null ? (mouseY - baseY - (window.innerWidth * 0.9 * 9 / 16) / 2) * 0.05 : 0;
            dynamicElements.introVideo.style.left = (baseX + randomDx + mouseDx) + "px";
            dynamicElements.introVideo.style.top = (baseY + randomDy + mouseDy - window.scrollY * 0.1) + "px";
        }

        if (dynamicElements.contactInfo) {
            const baseX = parseFloat(dynamicElements.contactInfo.dataset.baseX);
            const baseY = parseFloat(dynamicElements.contactInfo.dataset.baseY);
            const randomDx = parseFloat(dynamicElements.contactInfo.dataset.randomX) || 0;
            const randomDy = parseFloat(dynamicElements.contactInfo.dataset.randomY) || 0;
            const mouseDx = mouseX !== null ? (mouseX - baseX - dynamicElements.contactInfo.offsetWidth / 2) * 0.05 : 0;
            const mouseDy = mouseY !== null ? (mouseY - baseY - dynamicElements.contactInfo.offsetHeight / 2) * 0.05 : 0;
            dynamicElements.contactInfo.style.left = (baseX + randomDx + mouseDx) + "px";
            dynamicElements.contactInfo.style.top = (baseY + randomDy + mouseDy - window.scrollY * 0.1) + "px";
        }
    }

    setInterval(() => {
        stars.forEach(star => {
            star.dataset.randomX = (Math.random() - 0.5) * 10;
            star.dataset.randomY = (Math.random() - 0.5) * 10;
        });
        planets.forEach(planet => {
            planet.dataset.randomX = (Math.random() - 0.5) * 10;
            planet.dataset.randomY = (Math.random() - 0.5) * 10;
        });
        updatePositions(null, null);
    }, 2000);

    document.addEventListener('mousemove', (e) => {
        updatePositions(e.clientX, e.clientY + window.scrollY);
    });

    document.addEventListener('mouseleave', () => {
        updatePositions(null, null);
    });

    document.addEventListener('routeChange', (e) => {
        updatePositions(null, null);
    });

    return () => updatePositions(null, null); // Função para resetar posições
}