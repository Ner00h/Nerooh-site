import '../styles/style.css';
import '../styles/checkout.css';
import { initBackground, animateBackground } from './background.js';
import { initRouter, setupEventListeners } from './router.js';
import { setupAuth, isAdmin } from './auth.js';
import { getCart, onCartUpdate } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const { stars, planets } = initBackground();

    let dynamicElements = {};
    let isUserAuthenticated = false;
    let routerInitialized = false;

    // Adicionar o botão do carrinho global
    setupCartButton();

    function updateDynamicElements(elements) {
        dynamicElements = elements;
        animateBackground(stars, planets, dynamicElements);
    }

    // Inicializar o roteador apenas uma vez
    function initializeRouter() {
        if (!routerInitialized) {
            initRouter(contentDiv, updateDynamicElements, () => isUserAuthenticated);
            routerInitialized = true;
            
            // Verificar a visibilidade do botão do carrinho após a inicialização do roteador
            setTimeout(() => {
                const cartIcon = document.querySelector('.cart-icon');
                if (cartIcon && typeof window.updateCartIconVisibility === 'function') {
                    window.updateCartIconVisibility();
                }
            }, 200);
        }
    }

    // Função para configurar o botão do carrinho global
    function setupCartButton() {
        // Verificar se o botão já existe
        let cartIcon = document.querySelector('.cart-icon');
        
        if (!cartIcon) {
            cartIcon = document.createElement('div');
            cartIcon.classList.add('cart-icon');
            cartIcon.innerHTML = '🛒';
            
            // Adicionar badge com a contagem de itens
            const cartBadge = document.createElement('span');
            cartBadge.classList.add('cart-badge');
            updateCartBadge();
            cartIcon.appendChild(cartBadge);
            
            // Adicionar evento para ir para a página do carrinho
            cartIcon.addEventListener('click', () => {
                // Se estiver na página de produtos ou detalhes de produtos, mostrar o mini-carrinho
                const path = window.location.pathname;
                if (path.startsWith('/produtos')) {
                    const miniCart = document.querySelector('.mini-cart-container');
                    if (miniCart) {
                        miniCart.style.display = miniCart.style.display === 'none' ? 'flex' : 'none';
                        return;
                    }
                }
                
                // Caso contrário, ir para a página do carrinho
                // Rolar a página para o topo antes de mudar de rota
                window.scrollTo(0, 0);
                
                history.pushState({ page: 'cart' }, null, '/carrinho');
                window.dispatchEvent(new Event('route-change'));
            });
            
            // Adicionar o ícone do carrinho ao body
            document.body.appendChild(cartIcon);
            
            // Verificar se deve mostrar o botão do carrinho
            updateCartIconVisibility();
            
            // Registrar callback para atualizar o badge quando o carrinho for atualizado
            onCartUpdate((cart) => {
                updateCartBadge();
                updateCartIconVisibility();
                
                if (cart.length > 0) {
                    cartIcon.classList.add('cart-bounce');
                    setTimeout(() => cartIcon.classList.remove('cart-bounce'), 500);
                    
                    // Mostrar o mini-carrinho quando um produto for adicionado
                    const miniCart = document.querySelector('.mini-cart-container');
                    if (miniCart) {
                        miniCart.style.display = 'flex';
                        
                        // Ocultar o mini-carrinho após 3 segundos
                        setTimeout(() => {
                            miniCart.style.display = 'none';
                        }, 3000);
                    }
                }
            });
            
            // Adicionar evento para verificar a visibilidade do botão quando a rota mudar
            window.addEventListener('route-change', updateCartIconVisibility);
            window.addEventListener('popstate', updateCartIconVisibility);
            window.addEventListener('route-loaded', updateCartIconVisibility);
            
            // Expor a função para uso global
            window.updateCartIconVisibility = updateCartIconVisibility;
            
            // Verificar o caminho inicial
            const initialPath = window.location.pathname;
            const cartItems = getCart();
            const hasItems = cartItems.length > 0;
            
            // Definir a visibilidade inicial do botão
            if (initialPath.startsWith('/produtos') || initialPath === '/carrinho' || hasItems) {
                cartIcon.style.display = 'flex';
            } else {
                cartIcon.style.display = 'none';
            }
            
            // Adicionar classe especial na página do carrinho
            if (initialPath === '/carrinho') {
                cartIcon.classList.add('on-cart-page');
            }
        }
        
        // Função para atualizar o badge do carrinho
        function updateCartBadge() {
            const cartItems = getCart();
            const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
            const cartBadge = cartIcon.querySelector('.cart-badge');
            
            if (cartBadge) {
                cartBadge.textContent = itemCount;
                
                if (itemCount > 0) {
                    cartBadge.style.display = 'flex';
                } else {
                    cartBadge.style.display = 'none';
                }
            }
        }
        
        // Função para verificar se deve mostrar o botão do carrinho
        function updateCartIconVisibility() {
            const path = window.location.pathname;
            const cartItems = getCart();
            const hasItems = cartItems.length > 0;
            
            // Mostrar o botão apenas nas páginas de produtos/detalhes ou se tiver itens no carrinho
            if (path.startsWith('/produtos') || path === '/carrinho' || hasItems) {
                cartIcon.style.display = 'flex';
            } else {
                cartIcon.style.display = 'none';
            }
            
            // Adicionar classe especial na página do carrinho
            if (path === '/carrinho') {
                cartIcon.classList.add('on-cart-page');
            } else {
                cartIcon.classList.remove('on-cart-page');
            }
        }
    }

    const cleanupAuth = setupAuth((authenticated) => {
        isUserAuthenticated = authenticated;
        
        // Não adicionar link de admin no header, será adicionado no dropdown menu
        
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

    // Adicionar evento de redimensionamento da janela
    window.addEventListener('resize', () => {
        // Reposicionar elementos dinâmicos quando a janela for redimensionada
        Object.entries(dynamicElements).forEach(([key, element]) => {
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

    // Inicializar o roteador apenas uma vez
    initializeRouter();
});