import '../styles/style.css';
import { initBackground, animateBackground } from './background.js';
import { initRouter } from './router.js';
import { setupAuth } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const { stars, planets } = initBackground();

    let dynamicElements = {};
    let isUserAuthenticated = false;
    let routerInitialized = false;

    function updateDynamicElements(elements) {
        dynamicElements = elements;
        animateBackground(stars, planets, dynamicElements);
    }

    // Inicializar o roteador apenas uma vez
    function initializeRouter() {
        if (!routerInitialized) {
            initRouter(contentDiv, updateDynamicElements, () => isUserAuthenticated);
            routerInitialized = true;
        }
    }

    const cleanupAuth = setupAuth((authenticated) => {
        isUserAuthenticated = authenticated;
        // Não inicializar o roteador aqui, apenas disparar um evento para atualizar a UI
        if (routerInitialized) {
            window.dispatchEvent(new Event('auth-state-changed'));
        }
    });

    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            header.classList.add('scrolled');
            const opacity = Math.min(scrollY / 200, 0.95);
            header.style.background = `linear-gradient(to bottom, rgba(10, 10, 10, ${opacity}) 85%, rgba(10, 10, 10, 0))`;
        } else {
            header.classList.remove('scrolled');
            header.style.background = 'transparent';
        }
    });

    // Inicializar o roteador apenas uma vez
    initializeRouter();
});