import { getCart, updateQuantity, removeFromCart, clearCart, getCartTotal } from '../core/cart.js';
import { isAuthenticated } from '../core/auth.js';

export function renderCartPage(contentDiv) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    // Container principal
    const cartPageContainer = document.createElement("div");
    cartPageContainer.classList.add("cart-page-container");
    contentDiv.appendChild(cartPageContainer);

    // Posicionamento fixo (sem movimento para economizar processamento)
    const baseX = window.innerWidth / 2 - cartPageContainer.offsetWidth / 2;
    const headerHeight = document.getElementById('header').offsetHeight;
    const baseY = headerHeight + 20;
    cartPageContainer.style.position = "absolute";
    cartPageContainer.style.left = baseX + 'px';
    cartPageContainer.style.top = baseY + 'px';
    
    // Função para ajustar a posição do container
    function adjustContainerPosition() {
        const updatedBaseX = window.innerWidth / 2 - cartPageContainer.offsetWidth / 2;
        cartPageContainer.style.left = updatedBaseX + 'px';
    }

    // Ajustar posição após um curto período para garantir que o DOM foi renderizado
    setTimeout(adjustContainerPosition, 50);

    // Renderizar o conteúdo do carrinho
    renderCartContent();

    // Função para renderizar o conteúdo do carrinho
    function renderCartContent() {
        const cart = getCart();
        const total = getCartTotal();
        
        if (cart.length === 0) {
            // Carrinho vazio
            cartPageContainer.innerHTML = `
                <div class="cart-page-empty">
                    <h1>Seu Carrinho</h1>
                    <p>Seu carrinho está vazio</p>
                    <a href="/produtos" class="cart-page-continue-shopping">Continuar Comprando</a>
                </div>
            `;
            
            // Adicionar evento ao link de continuar comprando
            cartPageContainer.querySelector('.cart-page-continue-shopping').addEventListener('click', (e) => {
                e.preventDefault();
                history.pushState({ page: 'products' }, null, '/produtos');
                window.dispatchEvent(new Event('route-change'));
            });
        } else {
            // Carrinho com itens
            cartPageContainer.innerHTML = `
                <h1 class="cart-page-title">Seu Carrinho</h1>
                <div class="cart-page-items">
                    ${cart.map(item => `
                        <div class="cart-page-item" data-product-id="${item.id}">
                            <div class="cart-page-item-image">
                                ${item.imageUrl 
                                    ? `<img src="${item.imageUrl}" alt="${item.title}">` 
                                    : '<div class="mini-cart-no-image">📦</div>'}
                            </div>
                            <div class="cart-page-item-info">
                                <h3 class="cart-page-item-title">${item.title}</h3>
                                <div class="cart-page-item-price">${item.price || 'Preço sob consulta'}</div>
                                <div class="cart-page-quantity">
                                    <button class="cart-page-quantity-minus">-</button>
                                    <input type="number" min="1" value="${item.quantity}" class="cart-page-quantity-input">
                                    <button class="cart-page-quantity-plus">+</button>
                                </div>
                            </div>
                            <div class="cart-page-item-total">
                                ${typeof item.price === 'string' && !isNaN(parseFloat(item.price.replace(/[^\d,]/g, '').replace(',', '.')))
                                    ? `R$ ${(parseFloat(item.price.replace(/[^\d,]/g, '').replace(',', '.')) * item.quantity).toFixed(2)}`
                                    : 'Preço sob consulta'}
                            </div>
                            <button class="cart-page-item-remove">×</button>
                        </div>
                    `).join('')}
                </div>
                <div class="cart-page-summary">
                    <div class="cart-page-subtotal">
                        <span>Subtotal:</span>
                        <span>R$ ${total.toFixed(2)}</span>
                    </div>
                    <div class="cart-page-total">
                        <span>Total:</span>
                        <span>R$ ${total.toFixed(2)}</span>
                    </div>
                    <button class="cart-page-checkout">Finalizar Compra</button>
                    <button class="cart-page-clear">Limpar Carrinho</button>
                    <a href="/produtos" class="cart-page-continue-shopping">Continuar Comprando</a>
                </div>
            `;
            
            // Adicionar eventos aos botões de quantidade
            cartPageContainer.querySelectorAll('.cart-page-item').forEach(item => {
                const productId = item.dataset.productId;
                const minusBtn = item.querySelector('.cart-page-quantity-minus');
                const plusBtn = item.querySelector('.cart-page-quantity-plus');
                const quantityInput = item.querySelector('.cart-page-quantity-input');
                const removeBtn = item.querySelector('.cart-page-item-remove');
                
                // Evento para diminuir quantidade
                minusBtn.addEventListener('click', () => {
                    const currentValue = parseInt(quantityInput.value);
                    if (currentValue > 1) {
                        updateQuantity(productId, currentValue - 1);
                        renderCartContent(); // Atualizar a página
                    }
                });
                
                // Evento para aumentar quantidade
                plusBtn.addEventListener('click', () => {
                    const currentValue = parseInt(quantityInput.value);
                    updateQuantity(productId, currentValue + 1);
                    renderCartContent(); // Atualizar a página
                });
                
                // Evento para atualizar quantidade pelo input
                quantityInput.addEventListener('change', () => {
                    const newValue = parseInt(quantityInput.value);
                    if (newValue >= 1) {
                        updateQuantity(productId, newValue);
                        renderCartContent(); // Atualizar a página
                    } else {
                        quantityInput.value = 1; // Valor mínimo
                    }
                });
                
                // Evento para remover item
                removeBtn.addEventListener('click', () => {
                    removeFromCart(productId);
                    renderCartContent(); // Atualizar a página
                });
            });
            
            // Evento para limpar carrinho
            cartPageContainer.querySelector('.cart-page-clear').addEventListener('click', () => {
                if (confirm('Tem certeza que deseja limpar o carrinho?')) {
                    clearCart();
                    renderCartContent(); // Atualizar a página
                }
            });
            
            // Evento para finalizar compra
            cartPageContainer.querySelector('.cart-page-checkout').addEventListener('click', () => {
                // Verificar se o usuário está logado
                if (isAuthenticated()) {
                    // Se estiver logado, redirecionar para checkout
                    // Rolar a página para o topo antes de mudar de rota
                    window.scrollTo(0, 0);
                    
                    history.pushState({ page: 'checkout' }, null, '/checkout');
                    window.dispatchEvent(new Event('route-change'));
                } else {
                    // Se não estiver logado, redirecionar para login com mensagem
                    // Rolar a página para o topo antes de mudar de rota
                    window.scrollTo(0, 0);
                    
                    // Armazenar também no localStorage para garantir que não seja perdido
                    localStorage.setItem('loginReturnTo', 'checkout');
                    
                    history.pushState({ 
                        page: 'login', 
                        returnTo: 'checkout',
                        message: 'Para finalizar sua compra, é necessário fazer login.'
                    }, null, '/login');
                    window.dispatchEvent(new Event('route-change'));
                }
            });
            
            // Evento para continuar comprando
            cartPageContainer.querySelector('.cart-page-continue-shopping').addEventListener('click', (e) => {
                e.preventDefault();
                history.pushState({ page: 'products' }, null, '/produtos');
                window.dispatchEvent(new Event('route-change'));
            });
        }
        
        // Ajustar posição após o carregamento do conteúdo
        setTimeout(adjustContainerPosition, 100);
    }

    // Adicionar evento de redimensionamento da janela
    window.addEventListener('resize', adjustContainerPosition);

    return {
        cleanup: () => {
            cartPageContainer.remove();
            window.removeEventListener('resize', adjustContainerPosition);
        },
        elements: {} // Retornar um objeto elements vazio para que o container não seja adicionado ao dynamicElements
    };
} 