import { getDatabase, ref, query, orderByChild, onValue } from 'firebase/database';
import { getCurrentUser } from '../core/auth.js';

export function renderMyOrdersPage(contentDiv) {
    contentDiv.innerHTML = '';
    
    const user = getCurrentUser();
    if (!user) {
        contentDiv.innerHTML = `
            <div class="my-orders-container">
                <div class="my-orders-message">
                    <h2>Acesso Negado</h2>
                    <p>Você precisa estar logado para ver seus pedidos.</p>
                    <button class="login-button" onclick="history.pushState({ page: 'login' }, null, '/login'); window.dispatchEvent(new Event('route-change'));">
                        Fazer Login
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    // Criar container principal
    const myOrdersContainer = document.createElement('div');
    myOrdersContainer.classList.add('my-orders-container');
    
    // Adicionar título
    const title = document.createElement('h2');
    title.textContent = 'Meus Pedidos';
    myOrdersContainer.appendChild(title);
    
    // Criar wrapper para a tabela
    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('my-orders-table-wrapper');
    
    // Criar tabela
    const table = document.createElement('table');
    table.classList.add('my-orders-table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Nº Pedido</th>
                <th>Data</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td colspan="5" class="loading-message">Carregando seus pedidos...</td>
            </tr>
        </tbody>
    `;
    tableWrapper.appendChild(table);
    myOrdersContainer.appendChild(tableWrapper);
    
    // Adicionar container ao conteúdo
    contentDiv.appendChild(myOrdersContainer);
    
    // Buscar pedidos do usuário
    const db = getDatabase();
    const salesRef = ref(db, 'sales');
    const userSalesQuery = query(salesRef, orderByChild('userId'));
    
    onValue(userSalesQuery, (snapshot) => {
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
        
        const orders = [];
        snapshot.forEach((childSnapshot) => {
            const order = childSnapshot.val();
            if (order.userId === user.uid) {
                orders.push({
                    id: childSnapshot.key,
                    ...order
                });
            }
        });
        
        // Ordenar pedidos por data (mais recentes primeiro)
        orders.sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp) : new Date(0);
            const timeB = b.timestamp ? new Date(b.timestamp) : new Date(0);
            return timeB - timeA;
        });
        
        if (orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="no-orders-message">
                        <p>Você ainda não fez nenhum pedido.</p>
                        <a href="/produtos" class="start-shopping-button" onclick="event.preventDefault(); history.pushState({ page: 'products' }, null, '/produtos'); window.dispatchEvent(new Event('route-change'));">
                            Começar a Comprar
                        </a>
                    </td>
                </tr>
            `;
            return;
        }
        
        orders.forEach(order => {
            const date = order.timestamp 
                ? new Date(order.timestamp).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
                : 'Data não disponível';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order.orderNumber || ''}</td>
                <td>${date}</td>
                <td>R$ ${order.total ? order.total.toFixed(2) : '0.00'}</td>
                <td>
                    <span class="status-badge status-${getStatusClass(order.status)}">
                        ${order.status}
                    </span>
                </td>
                <td>
                    <button class="order-details-btn" data-order-id="${order.id}">
                        Ver Detalhes
                    </button>
                </td>
            `;
            tbody.appendChild(row);
            
            // Adicionar evento ao botão de detalhes
            row.querySelector('.order-details-btn').addEventListener('click', () => {
                showOrderDetails(order);
            });
        });
    });
    
    // Função para mostrar detalhes do pedido
    function showOrderDetails(order) {
        const modal = document.createElement('div');
        modal.classList.add('order-details-modal');
        
        // Formatar data
        const date = order.timestamp 
            ? new Date(order.timestamp).toLocaleString('pt-BR')
            : 'Data não disponível';
        
        // Renderizar itens do pedido
        let itemsHtml = '';
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                const price = typeof item.price === 'number' ? item.price : parseFloat(item.price.replace(/[^\d,]/g, '').replace(',', '.'));
                const subtotal = price * item.quantity;
                
                itemsHtml += `
                    <div class="order-item">
                        <div class="order-item-info">
                            <h4>${item.title}</h4>
                            <p>Preço: R$ ${price.toFixed(2)}</p>
                            <p>Quantidade: ${item.quantity}</p>
                            <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>
                        </div>
                    </div>
                `;
            });
        } else {
            itemsHtml = '<p>Nenhum item encontrado</p>';
        }
        
        // Calcular subtotal
        const subtotal = order.items ? order.items.reduce((total, item) => {
            const price = typeof item.price === 'number' ? item.price : parseFloat(item.price.replace(/[^\d,]/g, '').replace(',', '.'));
            return total + (price * item.quantity);
        }, 0) : 0;
        
        modal.innerHTML = `
            <div class="order-details-content">
                <div class="order-details-header">
                    <h3>Detalhes do Pedido #${order.orderNumber}</h3>
                    <button class="close-modal-button">&times;</button>
                </div>
                
                <div class="order-details-info">
                    <p><strong>Data do Pedido:</strong> ${date}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Endereço de Entrega:</strong> ${order.customerAddress || 'Não informado'}</p>
                </div>
                
                <div class="order-items">
                    <h4>Itens do Pedido</h4>
                    ${itemsHtml}
                </div>
                
                <div class="order-summary">
                    <div class="order-subtotal">
                        <span>Subtotal:</span>
                        <span>R$ ${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div class="order-shipping">
                        <span>Frete (${order.shipping.name}):</span>
                        <span>R$ ${order.shipping.price.toFixed(2)}</span>
                    </div>
                    
                    <div class="order-total">
                        <span>Total:</span>
                        <span>R$ ${order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar evento para fechar o modal
        modal.querySelector('.close-modal-button').addEventListener('click', () => {
            modal.remove();
        });
        
        // Fechar o modal ao clicar fora dele
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Função auxiliar para obter a classe CSS do status
    function getStatusClass(status) {
        switch (status) {
            case 'Pagamento pendente':
                return 'aguardando';
            case 'Pagamento em processamento':
                return 'processando';
            case 'Pagamento confirmado':
                return 'confirmado';
            case 'Enviado':
                return 'enviado';
            case 'Cancelado':
                return 'cancelado';
            default:
                return 'aguardando';
        }
    }
} 