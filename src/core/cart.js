// Gerenciamento do carrinho de compras

// Estado do carrinho
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Eventos do carrinho
const cartEvents = new EventTarget();

// Funções para manipular o carrinho
export function addToCart(product) {
    // Verificar se o produto já está no carrinho
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex >= 0) {
        // Se o produto já existe, incrementa a quantidade
        cart[existingProductIndex].quantity += 1;
    } else {
        // Se não existe, adiciona ao carrinho com quantidade 1
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: 1
        });
    }
    
    // Salvar no localStorage
    saveCart();
    
    // Disparar evento de atualização
    cartEvents.dispatchEvent(new CustomEvent('cart-updated'));
    
    return cart;
}

export function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    cartEvents.dispatchEvent(new CustomEvent('cart-updated'));
    return cart;
}

export function updateQuantity(productId, quantity) {
    const productIndex = cart.findIndex(item => item.id === productId);
    
    if (productIndex >= 0) {
        if (quantity <= 0) {
            // Se a quantidade for zero ou negativa, remove o item
            return removeFromCart(productId);
        }
        
        cart[productIndex].quantity = quantity;
        saveCart();
        cartEvents.dispatchEvent(new CustomEvent('cart-updated'));
    }
    
    return cart;
}

export function getCart() {
    return [...cart]; // Retorna uma cópia do carrinho
}

export function getCartTotal() {
    return cart.reduce((total, item) => {
        // Verifica se o preço é uma string e converte para número
        const price = typeof item.price === 'string' 
            ? parseFloat(item.price.replace(/[^\d,]/g, '').replace(',', '.')) 
            : item.price;
        
        // Se o preço não for um número válido, retorna o total atual
        if (isNaN(price)) return total;
        
        return total + (price * item.quantity);
    }, 0);
}

export function clearCart() {
    cart = [];
    saveCart();
    cartEvents.dispatchEvent(new CustomEvent('cart-updated'));
    return cart;
}

export function onCartUpdate(callback) {
    const handler = () => callback(getCart(), getCartTotal());
    cartEvents.addEventListener('cart-updated', handler);
    
    // Retorna uma função para remover o listener
    return () => cartEvents.removeEventListener('cart-updated', handler);
}

// Função auxiliar para salvar o carrinho no localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Função para renderizar o mini-carrinho
export function renderMiniCart(container) {
    const miniCartContainer = document.createElement('div');
    miniCartContainer.classList.add('mini-cart-container');
    
    // Posicionar o mini-carrinho acima do botão flutuante
    miniCartContainer.style.position = 'fixed';
    miniCartContainer.style.bottom = '90px';
    miniCartContainer.style.right = '20px';
    
    updateMiniCartContent(miniCartContainer);
    
    // Adicionar evento para atualizar o conteúdo quando o carrinho for atualizado
    onCartUpdate(() => updateMiniCartContent(miniCartContainer));
    
    container.appendChild(miniCartContainer);
    
    return miniCartContainer;
}

// Função para atualizar o conteúdo do mini-carrinho
function updateMiniCartContent(container) {
    const currentCart = getCart();
    const total = getCartTotal();
    
    container.innerHTML = `
        <div class="mini-cart-header">
            <h3>Carrinho</h3>
            <span class="mini-cart-count">${currentCart.length} item(s)</span>
        </div>
        <div class="mini-cart-items">
            ${currentCart.length === 0 
                ? '<p class="mini-cart-empty">Seu carrinho está vazio</p>' 
                : currentCart.map(item => `
                    <div class="mini-cart-item">
                        <div class="mini-cart-item-image">
                            ${item.imageUrl 
                                ? `<img src="${item.imageUrl}" alt="${item.title}">` 
                                : '<div class="mini-cart-no-image">📦</div>'}
                        </div>
                        <div class="mini-cart-item-info">
                            <h4>${item.title}</h4>
                            <div class="mini-cart-item-price">
                                <span>${item.price || 'Preço sob consulta'}</span>
                                <span>Qtd: ${item.quantity}</span>
                            </div>
                        </div>
                        <button class="mini-cart-remove-btn" data-product-id="${item.id}">×</button>
                    </div>
                `).join('')}
        </div>
        <div class="mini-cart-footer">
            <div class="mini-cart-total">
                <span>Total:</span>
                <span>R$ ${total.toFixed(2)}</span>
            </div>
            <a href="/carrinho" class="mini-cart-view-cart">Ver Carrinho</a>
            <button class="mini-cart-checkout-btn" ${currentCart.length === 0 ? 'disabled' : ''}>
                Finalizar Compra
            </button>
        </div>
    `;
    
    // Adicionar eventos aos botões de remover
    container.querySelectorAll('.mini-cart-remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            removeFromCart(productId);
        });
    });
    
    // Adicionar evento ao botão de finalizar compra
    const checkoutBtn = container.querySelector('.mini-cart-checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            history.pushState({ page: 'checkout' }, null, '/checkout');
            window.dispatchEvent(new Event('route-change'));
            // Fechar o mini-carrinho
            container.style.display = 'none';
        });
    }
    
    // Adicionar evento ao link de ver carrinho
    const viewCartLink = container.querySelector('.mini-cart-view-cart');
    if (viewCartLink) {
        viewCartLink.addEventListener('click', (e) => {
            e.preventDefault();
            history.pushState({ page: 'cart' }, null, '/carrinho');
            window.dispatchEvent(new Event('route-change'));
            // Fechar o mini-carrinho
            container.style.display = 'none';
        });
    }
} 