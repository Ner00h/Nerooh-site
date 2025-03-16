import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, push, serverTimestamp, onValue, set } from 'firebase/database';
import { getCart, getCartTotal, clearCart } from '../core/cart.js';
import { renderLoginPage } from './login.js';

// Função para renderizar a página de checkout
export function renderCheckoutPage(contentDiv) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    // Criar um wrapper para conter o container
    const checkoutWrapper = document.createElement("div");
    checkoutWrapper.classList.add("checkout-wrapper");
    contentDiv.appendChild(checkoutWrapper);

    // Container principal
    const checkoutContainer = document.createElement("div");
    checkoutContainer.classList.add("checkout-container");
    checkoutWrapper.appendChild(checkoutContainer);

    // Posicionamento do wrapper
    const headerHeight = document.getElementById('header').offsetHeight;
    const baseY = headerHeight + 20;
    checkoutWrapper.style.paddingTop = baseY + 'px';
    
    // Verificar se o usuário está logado
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuário está logado, mostrar formulário de checkout
            renderCheckoutForm(user);
        } else {
            // Usuário não está logado, redirecionar diretamente para login
            
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

    // Função para renderizar o formulário de checkout
    function renderCheckoutForm(user) {
        const cart = getCart();
        const total = getCartTotal();
        
        if (cart.length === 0) {
            // Carrinho vazio
            checkoutContainer.innerHTML = `
                <div class="checkout-empty">
                    <h1>Finalizar Compra</h1>
                    <p>Seu carrinho está vazio</p>
                    <a href="/produtos" class="checkout-continue-shopping">Continuar Comprando</a>
                </div>
            `;
            
            // Adicionar evento ao link de continuar comprando
            checkoutContainer.querySelector('.checkout-continue-shopping').addEventListener('click', (e) => {
                e.preventDefault();
                history.pushState({ page: 'products' }, null, '/produtos');
                window.dispatchEvent(new Event('route-change'));
            });
            return;
        }

        // Etapas do checkout
        let currentStep = 1;
        const totalSteps = 3;

        // Renderizar a primeira etapa (informações pessoais)
        renderCheckoutStep(currentStep);

        // Função para renderizar cada etapa do checkout
        function renderCheckoutStep(step) {
            switch(step) {
                case 1:
                    renderPersonalInfoStep();
                    break;
                case 2:
                    renderOrderSummaryStep();
                    break;
                case 3:
                    renderPaymentStep();
                    break;
            }
        }

        // Etapa 1: Informações pessoais
        function renderPersonalInfoStep() {
            checkoutContainer.innerHTML = `
                <div class="checkout-step">
                    <h1>Finalizar Compra</h1>
                    <div class="checkout-progress">
                        <div class="checkout-progress-step active">1. Informações Pessoais</div>
                        <div class="checkout-progress-step">2. Resumo do Pedido</div>
                        <div class="checkout-progress-step">3. Pagamento</div>
                    </div>
                    
                    <form id="personal-info-form" class="checkout-form">
                        <div class="form-group">
                            <label for="name">Nome Completo</label>
                            <input type="text" id="name" name="name" required value="${user.displayName || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label for="email">E-mail</label>
                            <input type="email" id="email" name="email" required value="${user.email || ''}" readonly>
                        </div>
                        
                        <div class="form-group">
                            <label for="phone">Telefone</label>
                            <input type="tel" id="phone" name="phone" required placeholder="(XX) XXXXX-XXXX">
                        </div>
                        
                        <div class="form-group">
                            <label for="address">Endereço Completo</label>
                            <textarea id="address" name="address" required rows="3" placeholder="Rua, número, complemento, bairro, cidade, estado, CEP"></textarea>
                        </div>
                        
                        <div class="checkout-buttons">
                            <a href="/carrinho" class="checkout-back-button">Voltar para o Carrinho</a>
                            <button type="submit" class="checkout-next-button">Próximo</button>
                        </div>
                    </form>
                </div>
            `;
            
            // Adicionar evento ao formulário
            checkoutContainer.querySelector('#personal-info-form').addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Salvar informações do formulário
                const formData = new FormData(e.target);
                const customerInfo = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    address: formData.get('address')
                };
                
                // Salvar no localStorage para uso posterior
                localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
                
                // Avançar para a próxima etapa
                currentStep++;
                renderCheckoutStep(currentStep);
            });
            
            // Adicionar evento ao link de voltar
            checkoutContainer.querySelector('.checkout-back-button').addEventListener('click', (e) => {
                e.preventDefault();
                history.pushState({ page: 'cart' }, null, '/carrinho');
                window.dispatchEvent(new Event('route-change'));
            });
        }

        // Etapa 2: Resumo do pedido
        function renderOrderSummaryStep() {
            checkoutContainer.innerHTML = `
                <div class="checkout-step">
                    <h1>Finalizar Compra</h1>
                    <div class="checkout-progress">
                        <div class="checkout-progress-step completed">1. Informações Pessoais</div>
                        <div class="checkout-progress-step active">2. Resumo do Pedido</div>
                        <div class="checkout-progress-step">3. Pagamento</div>
                    </div>
                    
                    <div class="checkout-order-summary">
                        <h2>Resumo do Pedido</h2>
                        
                        <div class="checkout-items">
                            ${cart.map(item => `
                                <div class="checkout-item">
                                    <div class="checkout-item-image">
                                        ${item.imageUrl 
                                            ? `<img src="${item.imageUrl}" alt="${item.title}">` 
                                            : '<div class="checkout-no-image">📦</div>'}
                                    </div>
                                    <div class="checkout-item-info">
                                        <h3 class="checkout-item-title">${item.title}</h3>
                                        <div class="checkout-item-price">${item.price || 'Preço sob consulta'}</div>
                                        <div class="checkout-item-quantity">Quantidade: ${item.quantity}</div>
                                    </div>
                                    <div class="checkout-item-total">
                                        ${typeof item.price === 'string' && !isNaN(parseFloat(item.price.replace(/[^\d,]/g, '').replace(',', '.')))
                                            ? `R$ ${(parseFloat(item.price.replace(/[^\d,]/g, '').replace(',', '.')) * item.quantity).toFixed(2)}`
                                            : 'Preço sob consulta'}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="checkout-summary">
                            <div class="checkout-subtotal">
                                <span>Subtotal:</span>
                                <span>R$ ${total.toFixed(2)}</span>
                            </div>
                            <div class="checkout-total">
                                <span>Total:</span>
                                <span>R$ ${total.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <div class="checkout-customer-info">
                            <h3>Informações do Cliente</h3>
                            <div class="customer-info-details">
                                ${(() => {
                                    const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || '{}');
                                    return `
                                        <p><strong>Nome:</strong> ${customerInfo.name || ''}</p>
                                        <p><strong>E-mail:</strong> ${customerInfo.email || ''}</p>
                                        <p><strong>Telefone:</strong> ${customerInfo.phone || ''}</p>
                                        <p><strong>Endereço:</strong> ${customerInfo.address || ''}</p>
                                    `;
                                })()}
                            </div>
                        </div>
                        
                        <div class="checkout-buttons">
                            <button class="checkout-back-button">Voltar</button>
                            <button class="checkout-next-button">Ir para Pagamento</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Adicionar evento ao botão de voltar
            checkoutContainer.querySelector('.checkout-back-button').addEventListener('click', () => {
                currentStep--;
                renderCheckoutStep(currentStep);
            });
            
            // Adicionar evento ao botão de próximo
            checkoutContainer.querySelector('.checkout-next-button').addEventListener('click', () => {
                currentStep++;
                renderCheckoutStep(currentStep);
            });
        }

        // Etapa 3: Pagamento
        function renderPaymentStep() {
            // Gerar QR Code do PIX com o valor total
            // Nota: A API do QR Server não suporta diretamente a inclusão do valor no PIX
            // Estamos usando o código PIX estático e exibindo o valor separadamente
            const pixData = `00020126360014br.gov.bcb.pix0114pix@nerooh.xyz5204000053039865802BR5925Carlito Batista Do Nascim6009Sao Paulo62290525REC67BBEFC5523B146905260163047D36`;
            const pixQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pixData}`;
            
            // Gerar número do pedido
            const orderNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            
            // Obter informações do cliente
            const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || '{}');
            
            // Salvar a venda no Firebase com status "Pagamento pendente"
            const db = getDatabase();
            const salesRef = ref(db, 'sales');
            
            // Criar objeto com dados da venda
            const saleData = {
                orderNumber: orderNumber,
                userId: user.uid,
                userEmail: user.email,
                customerName: customerInfo.name || '',
                customerEmail: customerInfo.email || '',
                customerPhone: customerInfo.phone || '',
                customerAddress: customerInfo.address || '',
                items: cart.map(item => ({
                    ...item,
                    price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d,]/g, '').replace(',', '.')) : item.price
                })),
                total: total,
                status: 'Pagamento pendente',
                timestamp: serverTimestamp()
            };
            
            // Salvar no Firebase
            push(salesRef, saleData)
                .then((result) => {
                    console.log('Venda registrada com status "Pagamento pendente"');
                    const saleId = result.key;
                    
                    // Armazenar o ID da venda para atualização posterior
                    localStorage.setItem('currentSaleId', saleId);
                    
                    checkoutContainer.innerHTML = `
                        <div class="checkout-step">
                            <h1>Finalizar Compra</h1>
                            <div class="checkout-progress">
                                <div class="checkout-progress-step completed">1. Informações Pessoais</div>
                                <div class="checkout-progress-step completed">2. Resumo do Pedido</div>
                                <div class="checkout-progress-step active">3. Pagamento</div>
                            </div>
                            
                            <div class="checkout-payment">
                                <h2>Pagamento via PIX</h2>
                                
                                <div class="checkout-payment-info">
                                    <p class="checkout-payment-message">
                                        Não usamos gateways de pagamento. O pagamento será processado manualmente. Após efetuar o pagamento, basta clicar em confirmar pagamento e aguardar a confecção e envio dos seus produtos.
                                    </p>
                                    
                                    <div class="checkout-payment-total">
                                        <span>Valor Total:</span>
                                        <span>R$ ${total.toFixed(2)}</span>
                                    </div>
                                    
                                    <div class="checkout-pix-info">
                                        <p>PIX: pix@nerooh.xyz</p>
                                        <p>Aponte a câmera do seu celular para o QR Code abaixo:</p>
                                        
                                        <div class="checkout-qr-code">
                                            <img src="${pixQrCodeUrl}" alt="QR Code PIX">
                                        </div>
                                        <p class="checkout-pix-value">Valor a transferir: <strong>R$ ${total.toFixed(2)}</strong></p>
                                    </div>
                                    
                                    <button id="confirm-payment-button" class="checkout-confirm-button checkout-confirm-pulse">
                                        Confirmar Compra
                                    </button>
                                </div>
                                
                                <div class="checkout-buttons">
                                    <button class="checkout-back-button">Voltar</button>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // Adicionar evento ao botão de voltar
                    checkoutContainer.querySelector('.checkout-back-button').addEventListener('click', () => {
                        currentStep--;
                        renderCheckoutStep(currentStep);
                    });
                    
                    // Adicionar evento ao botão de confirmar pagamento
                    checkoutContainer.querySelector('#confirm-payment-button').addEventListener('click', () => {
                        // Obter o ID da venda atual
                        const currentSaleId = localStorage.getItem('currentSaleId');
                        
                        if (currentSaleId) {
                            // Atualizar o status da venda para "Pagamento confirmado"
                            const saleRef = ref(db, `sales/${currentSaleId}`);
                            
                            // Obter a venda atual
                            onValue(saleRef, (snapshot) => {
                                const sale = snapshot.val();
                                if (sale) {
                                    // Atualizar apenas o status
                                    set(saleRef, {
                                        ...sale,
                                        status: 'Pagamento confirmado'
                                    })
                                    .then(() => {
                                        console.log(`Status da venda ${currentSaleId} atualizado para "Pagamento confirmado"`);
                                        
                                        // Mostrar mensagem de confirmação
                                        checkoutContainer.innerHTML = `
                                            <div class="checkout-success">
                                                <div class="checkout-success-icon">✓</div>
                                                <h2>Compra Efetuada!</h2>
                                                <p>Seu pagamento está sendo processado e assim que confirmado enviaremos um email ou mensagem no WhatsApp confirmando o pedido.</p>
                                                <p>Seus dados foram enviados para ${user.email}.</p>
                                                <p class="checkout-order-number">Número do pedido: #${orderNumber}</p>
                                                <a href="/" class="checkout-home-button">Voltar para a Página Inicial</a>
                                            </div>
                                        `;
                                        
                                        // Adicionar evento ao botão de voltar para a página inicial
                                        checkoutContainer.querySelector('.checkout-home-button').addEventListener('click', (e) => {
                                            e.preventDefault();
                                            
                                            // Limpar o carrinho
                                            clearCart();
                                            
                                            // Limpar o ID da venda atual
                                            localStorage.removeItem('currentSaleId');
                                            
                                            // Redirecionar para a página inicial
                                            history.pushState({ page: 'home' }, null, '/');
                                            window.dispatchEvent(new Event('route-change'));
                                        });
                                    })
                                    .catch(error => {
                                        console.error('Erro ao atualizar status da venda:', error);
                                        alert('Ocorreu um erro ao processar sua compra. Por favor, tente novamente.');
                                    });
                                }
                            }, { onlyOnce: true });
                        } else {
                            console.error('ID da venda não encontrado');
                            alert('Ocorreu um erro ao processar sua compra. Por favor, tente novamente.');
                        }
                    });
                })
                .catch(error => {
                    console.error('Erro ao registrar venda:', error);
                    alert('Ocorreu um erro ao processar sua compra. Por favor, tente novamente.');
                    
                    // Renderizar a etapa de pagamento sem salvar no Firebase
                    renderPaymentStepWithoutSaving();
                });
        }
        
        // Função auxiliar para renderizar a etapa de pagamento sem salvar no Firebase (em caso de erro)
        function renderPaymentStepWithoutSaving() {
            // Gerar QR Code do PIX com o valor total
            const pixData = `00020126360014br.gov.bcb.pix0114pix@nerooh.xyz5204000053039865802BR5925Carlito Batista Do Nascim6009Sao Paulo62290525REC67BBEFC5523B146905260163047D36`;
            const pixQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pixData}`;
            
            checkoutContainer.innerHTML = `
                <div class="checkout-step">
                    <h1>Finalizar Compra</h1>
                    <div class="checkout-progress">
                        <div class="checkout-progress-step completed">1. Informações Pessoais</div>
                        <div class="checkout-progress-step completed">2. Resumo do Pedido</div>
                        <div class="checkout-progress-step active">3. Pagamento</div>
                    </div>
                    
                    <div class="checkout-payment">
                        <h2>Pagamento via PIX</h2>
                        
                        <div class="checkout-payment-info">
                            <p class="checkout-payment-message">
                                Não usamos gateways de pagamento. O pagamento será processado manualmente. Após efetuar o pagamento, basta clicar em confirmar pagamento e aguardar a confecção e envio dos seus produtos.
                            </p>
                            
                            <div class="checkout-payment-total">
                                <span>Valor Total:</span>
                                <span>R$ ${total.toFixed(2)}</span>
                            </div>
                            
                            <div class="checkout-pix-info">
                                <p>PIX: pix@nerooh.xyz</p>
                                <p>Aponte a câmera do seu celular para o QR Code abaixo:</p>
                                
                                <div class="checkout-qr-code">
                                    <img src="${pixQrCodeUrl}" alt="QR Code PIX">
                                </div>
                                <p class="checkout-pix-value">Valor a transferir: <strong>R$ ${total.toFixed(2)}</strong></p>
                            </div>
                            
                            <button id="confirm-payment-button" class="checkout-confirm-button checkout-confirm-pulse">
                                Confirmar Compra
                            </button>
                        </div>
                        
                        <div class="checkout-buttons">
                            <button class="checkout-back-button">Voltar</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Adicionar evento ao botão de voltar
            checkoutContainer.querySelector('.checkout-back-button').addEventListener('click', () => {
                currentStep--;
                renderCheckoutStep(currentStep);
            });
            
            // Adicionar evento ao botão de confirmar pagamento
            checkoutContainer.querySelector('#confirm-payment-button').addEventListener('click', () => {
                // Gerar número do pedido
                const orderNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
                
                // Mostrar mensagem de confirmação
                checkoutContainer.innerHTML = `
                    <div class="checkout-success">
                        <div class="checkout-success-icon">✓</div>
                        <h2>Compra Efetuada!</h2>
                        <p>Seu pagamento está sendo processado e assim que confirmado enviaremos um email ou mensagem no WhatsApp confirmando o pedido.</p>
                        <p>Seus dados foram enviados para ${user.email}.</p>
                        <p class="checkout-order-number">Número do pedido: #${orderNumber}</p>
                        <a href="/" class="checkout-home-button">Voltar para a Página Inicial</a>
                    </div>
                `;
                
                // Adicionar evento ao botão de voltar para a página inicial
                checkoutContainer.querySelector('.checkout-home-button').addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Limpar o carrinho
                    clearCart();
                    
                    // Redirecionar para a página inicial
                    history.pushState({ page: 'home' }, null, '/');
                    window.dispatchEvent(new Event('route-change'));
                });
            });
        }
    }

    return {
        cleanup: () => {
            checkoutContainer.remove();
            checkoutWrapper.remove();
        },
        elements: {} // Retornar um objeto elements vazio para que o container não seja adicionado ao dynamicElements
    };
} 