import { renderHomePage } from '../pages/home.js';
import { renderControlPage } from '../pages/control.js';
import { renderContactPage } from '../pages/contact.js';
import { renderLoginPage } from '../pages/login.js';
import { renderProjectsPage } from '../pages/projects.js';
import { renderProductsPage } from '../pages/products.js';
import { renderProjectDetailPage } from '../pages/projectDetail.js';
import { renderProductDetailPage } from '../pages/productDetail.js';
import { renderAdminPage } from '../pages/admin.js';
import { isAuthenticated, isAdmin } from './auth.js';

// Exportar setupEventListeners para poder ser usado no main.js
export let setupEventListeners;

export function initRouter(contentDiv, updateDynamicElements, getAuthStatus) {
    // Variável para armazenar os elementos dinâmicos atuais
    let currentDynamicElements = {};
    
    // Função para atualizar os elementos dinâmicos
    function updateCurrentDynamicElements(elements) {
        currentDynamicElements = elements;
        updateDynamicElements(elements);
    }
    
    const routes = {
        '/': () => renderHomePage(contentDiv),
        '/controle': () => {
            return renderControlPage(contentDiv);
        },
        '/contato': () => renderContactPage(contentDiv),
        '/projetos': () => renderProjectsPage(contentDiv),
        '/produtos': () => renderProductsPage(contentDiv),
        '/admin': () => {
            console.log("Tentando acessar a rota de admin, isAdmin():", isAdmin());
            if (!isAdmin()) {
                history.pushState({ page: 'login' }, null, '/login');
                return renderLoginPage(contentDiv, "Faça login como administrador para acessar esta página.");
            }
            return renderAdminPage(contentDiv);
        },
        '/login': (message) => {
            if (getAuthStatus()) {
                history.pushState({ page: 'control' }, null, '/controle');
                return renderControlPage(contentDiv);
            }
            const loginMessage = message === 'controle' 
                ? "Para ter acesso ao controle das impressoras, primeiro você precisa se logar."
                : null;
            return renderLoginPage(contentDiv, loginMessage);
        }
    };

    let currentCleanup = null;

    function loadRoute() {
        console.log('Carregando rota:', window.location.pathname);
        
        // Limpar a página atual antes de carregar a nova
        if (currentCleanup) {
            console.log('Executando limpeza da página anterior');
            currentCleanup();
            currentCleanup = null;
        }

        // Limpar o conteúdo do contentDiv para evitar duplicações
        contentDiv.innerHTML = '';

        const path = window.location.pathname || '/';
        const state = history.state || {};
        const message = state.message;
        
        // Verificar se é uma rota de detalhe de projeto
        const projectDetailMatch = path.match(/^\/projetos\/([a-zA-Z0-9-]+)$/);
        if (projectDetailMatch) {
            const projectId = projectDetailMatch[1];
            console.log('Renderizando detalhe do projeto:', projectId);
            const { cleanup, elements } = renderProjectDetailPage(contentDiv, projectId);
            currentCleanup = cleanup;
            updateCurrentDynamicElements(elements);
            
            // Garantir que os elementos sejam posicionados corretamente após a renderização
            setTimeout(() => {
                Object.values(elements).forEach(element => {
                    if (element && element.offsetWidth && element.offsetHeight) {
                        const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                        const baseX = window.innerWidth / 2 - element.offsetWidth / 2;
                        const baseY = headerHeight + 20;
                        element.dataset.baseX = baseX.toString();
                        element.dataset.baseY = baseY.toString();
                        element.style.position = "absolute";
                        element.style.left = baseX + "px";
                        element.style.top = baseY + "px";
                    }
                });
            }, 100);
            
            return;
        }
        
        // Verificar se é uma rota de detalhe de produto
        const productDetailMatch = path.match(/^\/produtos\/([a-zA-Z0-9-]+)$/);
        if (productDetailMatch) {
            const productId = productDetailMatch[1];
            console.log('Renderizando detalhe do produto:', productId);
            const { cleanup, elements } = renderProductDetailPage(contentDiv, productId);
            currentCleanup = cleanup;
            updateCurrentDynamicElements(elements);
            
            // Garantir que os elementos sejam posicionados corretamente após a renderização
            setTimeout(() => {
                Object.values(elements).forEach(element => {
                    if (element && element.offsetWidth && element.offsetHeight) {
                        const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                        const baseX = window.innerWidth / 2 - element.offsetWidth / 2;
                        const baseY = headerHeight + 20;
                        element.dataset.baseX = baseX.toString();
                        element.dataset.baseY = baseY.toString();
                        element.style.position = "absolute";
                        element.style.left = baseX + "px";
                        element.style.top = baseY + "px";
                    }
                });
            }, 100);
            
            return;
        }
        
        let route;
        if (path === '/login') {
            route = () => routes['/login'](message);
        } else {
            route = routes[path] || routes['/'];
        }
        
        console.log('Renderizando rota:', path);
        const { cleanup, elements } = route();
        currentCleanup = cleanup;
        updateCurrentDynamicElements(elements);
        
        // Garantir que os elementos sejam posicionados corretamente após a renderização
        setTimeout(() => {
            Object.entries(elements || {}).forEach(([key, element]) => {
                if (element && element.offsetWidth && element.offsetHeight) {
                    // Não reposicionar elementos da página inicial (introText e introVideo)
                    const isHomeElement = key === 'introText' || key === 'introVideo';
                    
                    if (!isHomeElement) {
                        const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                        const baseX = window.innerWidth / 2 - element.offsetWidth / 2;
                        const baseY = headerHeight + 20;
                        element.dataset.baseX = baseX.toString();
                        element.dataset.baseY = baseY.toString();
                        element.style.position = "absolute";
                        element.style.left = baseX + "px";
                        element.style.top = baseY + "px";
                    }
                }
            });
        }, 100);
    }

    // Remover event listeners antigos para evitar duplicações
    setupEventListeners = function setupEventListeners() {
        document.querySelectorAll('.nav-item').forEach(link => {
            // Remover event listeners antigos
            const oldLink = link.cloneNode(true);
            link.parentNode.replaceChild(oldLink, link);
            
            // Adicionar novo event listener
            oldLink.addEventListener('click', (e) => {
                e.preventDefault();
                const page = oldLink.getAttribute('data-page');
                const path = page === 'control' ? '/controle' : 
                             page === 'contact' ? '/contato' : 
                             page === 'projects' ? '/projetos' : 
                             page === 'products' ? '/produtos' :
                             page === 'admin' ? '/admin' : '/';
                history.pushState({ page }, null, path);
                loadRoute();
            });
        });

        const authButton = document.getElementById('auth-button');
        if (authButton) {
            // Remover event listeners antigos
            const oldButton = authButton.cloneNode(true);
            authButton.parentNode.replaceChild(oldButton, authButton);
            
            // Adicionar novo event listener
            oldButton.addEventListener('click', () => {
                if (!getAuthStatus()) {
                    history.pushState({ page: 'login' }, null, '/login');
                    loadRoute();
                }
            });
        }
    }

    // Configurar event listeners
    setupEventListeners();

    // Escutar eventos de mudança de autenticação
    window.addEventListener('auth-state-changed', (event) => {
        console.log('Evento auth-state-changed recebido');
        loadRoute();
    });

    // Escutar eventos de mudança de rota personalizada
    window.addEventListener('route-change', () => {
        console.log('Evento route-change recebido');
        loadRoute();
        
        // Disparar um evento para reposicionar os elementos após a mudança de rota
        setTimeout(() => {
            window.dispatchEvent(new Event('reposition-elements'));
        }, 200);
    });

    // Escutar eventos de reposicionamento de elementos
    window.addEventListener('reposition-elements', () => {
        console.log('Reposicionando elementos após mudança de rota');
        Object.entries(currentDynamicElements || {}).forEach(([key, element]) => {
            if (element && element.offsetWidth && element.offsetHeight) {
                // Não reposicionar elementos da página inicial (introText e introVideo)
                const isHomeElement = key === 'introText' || key === 'introVideo';
                
                if (!isHomeElement) {
                    const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                    const baseX = window.innerWidth / 2 - element.offsetWidth / 2;
                    const baseY = headerHeight + 20;
                    element.dataset.baseX = baseX.toString();
                    element.dataset.baseY = baseY.toString();
                    element.style.position = "absolute";
                    element.style.left = baseX + "px";
                    element.style.top = baseY + "px";
                }
            }
        });
    });

    // Escutar eventos de navegação do histórico
    window.addEventListener('popstate', () => {
        console.log('Evento popstate recebido');
        loadRoute();
    });

    // Carregar a rota inicial
    loadRoute();
}