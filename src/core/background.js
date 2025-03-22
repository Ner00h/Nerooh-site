export function initBackground() {
    // Criar um container fixo para o background
    const backgroundContainer = document.createElement("div");
    backgroundContainer.id = "background-container";
    backgroundContainer.style.position = "fixed";
    backgroundContainer.style.top = "0";
    backgroundContainer.style.left = "0";
    backgroundContainer.style.width = "100vw";
    backgroundContainer.style.height = "100vh";
    backgroundContainer.style.overflow = "hidden";
    backgroundContainer.style.pointerEvents = "none";
    backgroundContainer.style.zIndex = "-1";
    document.body.appendChild(backgroundContainer);

    function createStar() {
        const star = document.createElement("div");
        star.classList.add("star");
        backgroundContainer.appendChild(star);
        const baseX = Math.random() * 100;
        const baseY = Math.random() * 100;
        star.style.left = baseX + "vw";
        star.style.top = baseY + "vh";
        star.style.animationDuration = (Math.random() * 5 + 5) + "s";
        star.dataset.baseX = baseX;
        star.dataset.baseY = baseY;
        return star;
    }

    function createPlanet() {
        const planet = document.createElement("div");
        planet.classList.add("planet");
        backgroundContainer.appendChild(planet);
        const size = Math.random() * 15 + 8;
        const baseX = Math.random() * 100;
        const baseY = Math.random() * 100;
        planet.style.width = size + "px";
        planet.style.height = size + "px";
        planet.style.left = baseX + "vw";
        planet.style.top = baseY + "vh";
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

    for (let i = 0; i < 70; i++) stars.push(createStar());
    for (let i = 0; i < 10; i++) planets.push(createPlanet());

    return { stars, planets };
}

export function animateBackground(stars, planets, dynamicElements = {}) {
    function updatePositions(mouseX, mouseY) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        stars.forEach(star => {
            const baseX = parseFloat(star.dataset.baseX);
            const baseY = parseFloat(star.dataset.baseY);
            const randomDx = parseFloat(star.dataset.randomX) || 0;
            const randomDy = parseFloat(star.dataset.randomY) || 0;
            const mouseDx = mouseX !== null ? ((mouseX / viewportWidth) * 100 - baseX) * 0.05 : 0;
            const mouseDy = mouseY !== null ? ((mouseY / viewportHeight) * 100 - baseY) * 0.05 : 0;
            star.style.left = (baseX + randomDx + mouseDx) + "vw";
            star.style.top = (baseY + randomDy + mouseDy) + "vh";
        });

        planets.forEach(planet => {
            const baseX = parseFloat(planet.dataset.baseX);
            const baseY = parseFloat(planet.dataset.baseY);
            const randomDx = parseFloat(planet.dataset.randomX) || 0;
            const randomDy = parseFloat(planet.dataset.randomY) || 0;
            const mouseDx = mouseX !== null ? ((mouseX / viewportWidth) * 100 - baseX) * 0.03 : 0;
            const mouseDy = mouseY !== null ? ((mouseY / viewportHeight) * 100 - baseY) * 0.03 : 0;
            planet.style.left = (baseX + randomDx + mouseDx) + "vw";
            planet.style.top = (baseY + randomDy + mouseDy) + "vh";
        });

        // Atualizar todos os dynamicElements (como productsContainer e projectsContainer)
        Object.entries(dynamicElements).forEach(([key, element]) => {
            if (!element || !element.offsetWidth || !element.offsetHeight) return;
            
            // Não reposicionar elementos da página inicial (introText e introVideo)
            const isHomeElement = key === 'introText' || key === 'introVideo';
            
            // Verificar se baseX e baseY já foram definidos
            if (!element.dataset.baseX || !element.dataset.baseY) {
                // Definir posição base inicial se não existir
                if (!isHomeElement) {
                    const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                    element.dataset.baseX = (window.innerWidth / 2 - element.offsetWidth / 2).toString();
                    element.dataset.baseY = (headerHeight + 20).toString();
                    element.style.position = "absolute";
                }
            }
            
            const baseX = parseFloat(element.dataset.baseX);
            const baseY = parseFloat(element.dataset.baseY);
            const randomDx = parseFloat(element.dataset.randomX) || 0;
            const randomDy = parseFloat(element.dataset.randomY) || 0;
            const mouseDx = mouseX !== null ? (mouseX - baseX - element.offsetWidth / 2) * 0.02 : 0;
            const mouseDy = mouseY !== null ? (mouseY - baseY - element.offsetHeight / 2) * 0.02 : 0;
            element.style.left = (baseX + randomDx + mouseDx) + "px";
            element.style.top = (baseY + randomDy + mouseDy - window.scrollY * 0.05) + "px";
        });
    }

    // Executar updatePositions imediatamente para posicionar os elementos corretamente
    updatePositions(null, null);

    // Executar updatePositions novamente após um curto período para garantir que os elementos estejam posicionados corretamente
    setTimeout(() => {
        updatePositions(null, null);
    }, 100);

    // Executar updatePositions novamente após o carregamento completo da página
    window.addEventListener('load', () => {
        updatePositions(null, null);
        
        // Executar novamente após um curto período para garantir que todos os elementos foram carregados
        setTimeout(() => {
            updatePositions(null, null);
        }, 200);
    });

    setInterval(() => {
        stars.forEach(star => {
            star.dataset.randomX = (Math.random() - 0.5) * 2;
            star.dataset.randomY = (Math.random() - 0.5) * 2;
        });
        planets.forEach(planet => {
            planet.dataset.randomX = (Math.random() - 0.5) * 2;
            planet.dataset.randomY = (Math.random() - 0.5) * 2;
        });
        Object.entries(dynamicElements).forEach(([key, element]) => {
            if (element) {
                element.dataset.randomX = (Math.random() - 0.5) * 10;
                element.dataset.randomY = (Math.random() - 0.5) * 10;
            }
        });
        updatePositions(null, null);
    }, 2000);

    document.addEventListener('mousemove', (e) => {
        const rect = document.getElementById('background-container').getBoundingClientRect();
        updatePositions(e.clientX - rect.left, e.clientY - rect.top);
    });

    document.addEventListener('mouseleave', () => {
        updatePositions(null, null);
    });

    document.addEventListener('routeChange', () => {
        updatePositions(null, null);
    });

    // Adicionar evento de redimensionamento da janela
    window.addEventListener('resize', () => {
        // Recalcular a posição base de todos os elementos dinâmicos
        Object.entries(dynamicElements).forEach(([key, element]) => {
            if (element && element.offsetWidth && element.offsetHeight) {
                // Não reposicionar elementos da página inicial (introText e introVideo)
                const isHomeElement = key === 'introText' || key === 'introVideo';
                
                if (!isHomeElement) {
                    const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                    element.dataset.baseX = (window.innerWidth / 2 - element.offsetWidth / 2).toString();
                    element.dataset.baseY = (headerHeight + 20).toString();
                }
            }
        });
        
        // Atualizar posições após recalcular
        updatePositions(null, null);
    });

    return () => updatePositions(null, null);
}