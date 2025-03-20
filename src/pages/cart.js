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
                    <div class="cart-page-buttons">
                        <button class="cart-page-checkout">Finalizar Compra</button>
                        <div class="cart-page-secondary-buttons">
                            <button class="cart-page-clear">Limpar Carrinho</button>
                            <a href="/produtos" class="cart-page-continue-shopping">Continuar Comprando</a>
                        </div>
                    </div>
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

// Adicionar estilos CSS
const shippingStyles = document.createElement('style');
shippingStyles.textContent = `
    .cart-page-shipping {
        background: rgba(30, 30, 50, 0.7);
        padding: 15px;
        border-radius: 4px;
        margin-bottom: 15px;
    }

    .cart-page-shipping h3 {
        margin: 0 0 10px;
        font-size: 1.1em;
        color: #fff;
    }

    .cart-page-shipping-input {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
    }

    .cart-page-shipping-input input {
        flex: 1;
        padding: 8px;
        border: 1px solid rgba(100, 100, 255, 0.3);
        border-radius: 4px;
        background: rgba(30, 30, 50, 0.8);
        color: #fff;
    }

    .cart-page-shipping-input button {
        padding: 8px 15px;
        background: linear-gradient(135deg, #4a90e2, #845ec2);
        border: none;
        border-radius: 4px;
        color: #fff;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .cart-page-shipping-input button:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    .shipping-options-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .shipping-option {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: rgba(40, 40, 60, 0.7);
        border-radius: 4px;
        cursor: pointer;
    }

    .shipping-option label {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 5px;
        flex: 1;
        cursor: pointer;
    }

    .shipping-company {
        font-weight: bold;
        color: #fff;
    }

    .shipping-service {
        color: #ccc;
        grid-column: 1;
    }

    .shipping-price {
        grid-column: 2;
        grid-row: 1;
        color: #4a90e2;
        font-weight: bold;
        text-align: right;
    }

    .shipping-time {
        grid-column: 2;
        grid-row: 2;
        color: #ccc;
        font-size: 0.9em;
        text-align: right;
    }

    .shipping-error {
        color: #ff6b6b;
        margin: 10px 0;
        text-align: center;
    }

    .cart-page-total small {
        display: block;
        font-size: 0.8em;
        color: #ccc;
        margin-top: 5px;
    }
`;
document.head.appendChild(shippingStyles);

// Adicionar os estilos CSS (após os estilos existentes do shipping)
const cartButtonStyles = document.createElement('style');
cartButtonStyles.textContent = `
    .cart-page-buttons {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-top: 20px;
        align-items: flex-end;
    }

    .cart-page-secondary-buttons {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }

    .cart-page-checkout {
        padding: 12px 25px;
        background: linear-gradient(135deg, #4a90e2, #845ec2);
        border: none;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 200px;
    }

    .cart-page-checkout:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .cart-page-clear {
        padding: 8px 15px;
        background: rgba(255, 107, 107, 0.1);
        border: 1px solid #ff6b6b;
        border-radius: 5px;
        color: #ff6b6b;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
    }

    .cart-page-clear:hover {
        background: rgba(255, 107, 107, 0.2);
        transform: translateY(-2px);
    }

    .cart-page-continue-shopping {
        padding: 8px 15px;
        background: rgba(74, 144, 226, 0.1);
        border: 1px solid #4a90e2;
        border-radius: 5px;
        color: #4a90e2;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        display: inline-block;
    }

    .cart-page-continue-shopping:hover {
        background: rgba(74, 144, 226, 0.2);
        transform: translateY(-2px);
    }

    @media (max-width: 768px) {
        .cart-page-buttons {
            align-items: stretch;
        }

        .cart-page-secondary-buttons {
            flex-direction: column;
            gap: 10px;
        }

        .cart-page-checkout,
        .cart-page-clear,
        .cart-page-continue-shopping {
            width: 100%;
            text-align: center;
        }
    }
`;
document.head.appendChild(cartButtonStyles);

// Adicionar estilos para o frete grátis
const freeShippingStyles = document.createElement('style');
freeShippingStyles.textContent = `
    .free-shipping {
        color: #4CAF50 !important;
        font-weight: bold;
    }
`;
document.head.appendChild(freeShippingStyles); 