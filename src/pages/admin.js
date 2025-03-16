import { getDatabase, ref, onValue, set, remove, query, orderByChild } from 'firebase/database';
import { isAdmin } from '../core/auth.js';
import Quill from 'quill';
import DOMPurify from 'dompurify';

export function renderAdminPage(contentDiv) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    const adminPanel = document.createElement('div');
    adminPanel.classList.add('admin-panel');
    
    adminPanel.innerHTML = `
        <h2>Painel de Administração</h2>
        
        <section id="sales-manager">
            <h3>Gerenciar Vendas</h3>
            <div id="sales-list-admin"></div>
        </section>
        
        <section id="project-manager">
            <h3>Gerenciar Projetos</h3>
            <button id="add-project-btn">Adicionar Novo Projeto</button>
            <div id="project-form-container" style="display: none;">
                <form id="project-form">
                    <div class="form-group">
                        <label for="project-title">Título do Projeto</label>
                        <input type="text" id="project-title" required>
                    </div>
                    <div class="form-group">
                        <label for="project-description">Descrição</label>
                        <textarea id="project-description" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="project-image">URL da Imagem</label>
                        <input type="url" id="project-image" required>
                    </div>
                    <div class="form-group">
                        <label for="project-progress">Progresso (%)</label>
                        <input type="number" id="project-progress" min="0" max="100" value="0">
                    </div>
                    <div class="form-buttons">
                        <button type="submit">Salvar</button>
                        <button type="button" id="cancel-project">Cancelar</button>
                    </div>
                    <input type="hidden" id="project-id">
                </form>
            </div>
            <div id="projects-list-admin"></div>
        </section>
        
        <section id="product-manager">
            <h3>Gerenciar Produtos</h3>
            <button id="add-product-btn">Adicionar Novo Produto</button>
            <div id="product-form-container" style="display: none;">
                <form id="product-form">
                    <div class="form-group">
                        <label for="product-title">Título do Produto</label>
                        <input type="text" id="product-title" required>
                    </div>
                    <div class="form-group">
                        <label for="product-description">Descrição</label>
                        <textarea id="product-description" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="product-price">Preço</label>
                        <input type="text" id="product-price" required>
                    </div>
                    <div class="form-group">
                        <label for="product-image">URL da Imagem</label>
                        <input type="url" id="product-image">
                    </div>
                    <div class="form-group">
                        <label for="product-link">Link para Compra (opcional)</label>
                        <input type="url" id="product-link">
                    </div>
                    <div class="form-buttons">
                        <button type="submit">Salvar</button>
                        <button type="button" id="cancel-product">Cancelar</button>
                    </div>
                    <input type="hidden" id="product-id">
                </form>
            </div>
            <div id="products-list-admin"></div>
        </section>
        
        <section id="subpage-manager">
            <h3>Criar/Editar Subpáginas</h3>
            <div class="subpage-type-selector">
                <label>
                    <input type="radio" name="subpage-type" value="project" checked> Projetos
                </label>
                <label>
                    <input type="radio" name="subpage-type" value="product"> Produtos
                </label>
            </div>
            <select id="subpage-select"></select>
            <div id="subpage-editor"></div>
        </section>
    `;
    contentDiv.appendChild(adminPanel);

    // Configurar gerenciadores
    setupSalesManager();
    setupProjectManager();
    setupProductManager();
    setupSubpageEditor();

    return {
        cleanup: () => {
            adminPanel.remove();
        },
        elements: {} // Retornar um objeto elements vazio para que o container não seja adicionado ao dynamicElements
    };
}

function setupSalesManager() {
    const db = getDatabase();
    const salesRef = ref(db, 'sales');
    const salesListAdmin = document.getElementById('sales-list-admin');
    
    // Adicionar estilos CSS para a tabela de vendas
    const style = document.createElement('style');
    style.textContent = `
        .sales-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            background-color: rgba(30, 30, 50, 0.7);
            border-radius: 4px;
            overflow: hidden;
            table-layout: fixed;
        }
        
        .sales-table th, .sales-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid rgba(100, 100, 255, 0.2);
            word-wrap: break-word;
            overflow: hidden;
            vertical-align: middle;
        }
        
        /* Definir larguras específicas para cada coluna */
        .sales-table th:nth-child(1),
        .sales-table td:nth-child(1) {
            width: 10%; /* Nº Pedido */
        }
        
        .sales-table th:nth-child(2),
        .sales-table td:nth-child(2) {
            width: 12%; /* Data */
        }
        
        .sales-table th:nth-child(3),
        .sales-table td:nth-child(3) {
            width: 18%; /* Cliente */
        }
        
        .sales-table th:nth-child(4),
        .sales-table td:nth-child(4) {
            width: 10%; /* Total */
        }
        
        .sales-table th:nth-child(5),
        .sales-table td:nth-child(5) {
            width: 38%; /* Status */
            min-width: 250px; /* Garantir espaço mínimo para o status */
        }
        
        .sales-table th:nth-child(6),
        .sales-table td:nth-child(6) {
            width: 12%; /* Ações */
        }
        
        .sales-table th {
            background-color: rgba(50, 50, 80, 0.8);
            color: #fff;
            font-weight: 500;
        }
        
        .sales-table tr:hover {
            background-color: rgba(50, 50, 80, 0.5);
        }
        
        .sales-table .sales-status-cell {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            min-height: 40px;
            padding: 5px;
        }
        
        .status-badge-container {
            display: flex;
            align-items: center;
            min-width: 120px;
            margin-right: 5px;
        }
        
        .sales-table .status-badge {
            padding: 6px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
            display: inline-block;
            min-width: 120px;
            text-align: center;
            overflow: visible;
            box-sizing: border-box;
        }
        
        .sales-table .status-aguardando {
            background-color: #f0ad4e;
            color: #000;
            max-width: none;
        }
        
        .sales-table .status-confirmado {
            background-color: #5cb85c;
            color: #fff;
            max-width: none;
        }
        
        .sales-table .status-enviado {
            background-color: #5bc0de;
            color: #fff;
            max-width: none;
        }
        
        .sales-table .status-cancelado {
            background-color: #d9534f;
            color: #fff;
            max-width: none;
        }
        
        .sales-table .status-select {
            padding: 4px;
            border-radius: 4px;
            border: 1px solid rgba(100, 100, 255, 0.3);
            background-color: rgba(30, 30, 50, 0.8);
            color: #fff;
            margin-left: 10px;
            max-width: 100%;
            min-width: 180px;
            height: 28px;
            font-size: 12px;
        }
        
        .sales-details-btn {
            background-color: #3a3a8c;
            color: #fff;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-right: 5px;
        }
        
        .sales-details-btn:hover {
            background-color: #4a4aac;
        }
        
        .sales-delete-btn {
            background-color: #e25c5c;
            color: #fff;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .sales-delete-btn:hover {
            background-color: #ff6b6b;
        }
        
        .sales-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .sales-modal-content {
            background-color: #1a1a2e;
            border-radius: 8px;
            padding: 20px;
            width: 80%;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 0 20px rgba(90, 90, 255, 0.5);
            border: 1px solid rgba(100, 100, 255, 0.3);
        }
        
        .sales-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(100, 100, 255, 0.3);
        }
        
        .sales-modal-close {
            background: none;
            border: none;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
        }
        
        .sales-modal-items {
            margin-bottom: 20px;
        }
        
        .sales-modal-item {
            display: flex;
            padding: 10px;
            border-bottom: 1px solid rgba(100, 100, 255, 0.2);
        }
        
        .sales-modal-item:last-child {
            border-bottom: none;
        }
        
        .sales-modal-item-info {
            flex: 1;
        }
        
        .sales-modal-customer {
            background-color: rgba(30, 30, 50, 0.7);
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        
        .sales-modal-customer p {
            margin: 5px 0;
        }
        
        .sales-modal-total {
            font-size: 18px;
            font-weight: bold;
            text-align: right;
            margin-top: 15px;
            color: #5a5aff;
        }
        
        .sales-filter {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .sales-filter select {
            padding: 8px;
            border-radius: 4px;
            border: 1px solid rgba(100, 100, 255, 0.3);
            background-color: rgba(30, 30, 50, 0.8);
            color: #fff;
        }
        
        /* Wrapper para rolagem horizontal em telas menores */
        .sales-table-wrapper {
            width: 100%;
            overflow-x: auto;
            margin-top: 15px;
        }
        
        /* Media query para telas menores */
        @media (max-width: 768px) {
            .sales-table {
                min-width: 800px; /* Garante que a tabela não fique muito comprimida */
            }
            
            .sales-table .sales-status-cell {
                flex-direction: column;
                align-items: flex-start;
                padding: 10px 5px;
            }
            
            .status-badge-container {
                width: 100%;
                margin-bottom: 8px;
            }
            
            .sales-table .status-badge {
                width: 100%;
                box-sizing: border-box;
                padding: 8px 10px;
                font-size: 13px;
            }
            
            .sales-table .status-select {
                margin-left: 0;
                margin-top: 8px;
                width: 100%;
                min-width: 100%;
                font-size: 13px;
                height: 32px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Criar filtro de status
    const filterContainer = document.createElement('div');
    filterContainer.classList.add('sales-filter');
    filterContainer.innerHTML = `
        <select id="sales-status-filter">
            <option value="all">Todos os Status</option>
            <option value="Pagamento pendente">Pagamento pendente</option>
            <option value="Pagamento confirmado">Pagamento confirmado</option>
            <option value="Enviado">Enviado</option>
            <option value="Cancelado">Cancelado</option>
        </select>
    `;
    salesListAdmin.appendChild(filterContainer);
    
    // Criar wrapper para a tabela
    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('sales-table-wrapper');
    salesListAdmin.appendChild(tableWrapper);
    
    // Criar tabela para exibir as vendas
    const salesTable = document.createElement('table');
    salesTable.classList.add('sales-table');
    salesTable.innerHTML = `
        <thead>
            <tr>
                <th>Nº Pedido</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody id="sales-table-body">
            <tr>
                <td colspan="6" style="text-align: center;">Carregando vendas...</td>
            </tr>
        </tbody>
    `;
    tableWrapper.appendChild(salesTable);
    
    // Filtrar vendas por status
    const statusFilter = document.getElementById('sales-status-filter');
    statusFilter.addEventListener('change', () => {
        loadSales(statusFilter.value);
    });
    
    // Função para carregar as vendas
    function loadSales(statusFilter = 'all') {
        const salesQuery = query(salesRef, orderByChild('timestamp'));
        
        onValue(salesQuery, (snapshot) => {
            const salesTableBody = document.getElementById('sales-table-body');
            salesTableBody.innerHTML = '';
            
            const sales = [];
            snapshot.forEach((childSnapshot) => {
                const sale = {
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                };
                sales.push(sale);
            });
            
            // Ordenar vendas por data (mais recentes primeiro)
            sales.sort((a, b) => {
                const timeA = a.timestamp ? new Date(a.timestamp) : new Date(0);
                const timeB = b.timestamp ? new Date(b.timestamp) : new Date(0);
                return timeB - timeA;
            });
            
            // Filtrar por status se necessário
            const filteredSales = statusFilter === 'all' 
                ? sales 
                : sales.filter(sale => sale.status === statusFilter);
            
            if (filteredSales.length === 0) {
                salesTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center;">Nenhuma venda encontrada</td>
                    </tr>
                `;
                return;
            }
            
            // Renderizar cada venda na tabela
            filteredSales.forEach(sale => {
                const date = sale.timestamp 
                    ? new Date(sale.timestamp).toLocaleDateString('pt-BR') 
                    : 'Data não disponível';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${sale.orderNumber || ''}</td>
                    <td>${date}</td>
                    <td>${sale.customerName || sale.userEmail || 'Cliente não identificado'}</td>
                    <td>R$ ${sale.total ? sale.total.toFixed(2) : '0.00'}</td>
                    <td class="sales-status-cell">
                        <div class="status-badge-container">
                            <span class="status-badge status-${getStatusClass(sale.status)}">${sale.status}</span>
                        </div>
                        <select class="status-select" data-sale-id="${sale.id}">
                            <option value="Pagamento pendente" ${sale.status === 'Pagamento pendente' ? 'selected' : ''}>Pagamento pendente</option>
                            <option value="Pagamento confirmado" ${sale.status === 'Pagamento confirmado' ? 'selected' : ''}>Pagamento confirmado</option>
                            <option value="Enviado" ${sale.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
                            <option value="Cancelado" ${sale.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                        </select>
                    </td>
                    <td>
                        <button class="sales-details-btn" data-sale-id="${sale.id}">Detalhes</button>
                        <button class="sales-delete-btn" data-sale-id="${sale.id}">Excluir</button>
                    </td>
                `;
                salesTableBody.appendChild(row);
            });
            
            // Adicionar eventos aos botões de detalhes e excluir
            document.querySelectorAll('.sales-details-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const saleId = btn.dataset.saleId;
                    const sale = sales.find(s => s.id === saleId);
                    if (sale) {
                        showSaleDetails(sale);
                    }
                });
            });
            
            // Adicionar eventos aos botões de excluir
            document.querySelectorAll('.sales-delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const saleId = btn.dataset.saleId;
                    const sale = sales.find(s => s.id === saleId);
                    if (sale && confirm(`Tem certeza que deseja excluir o pedido #${sale.orderNumber || saleId}?`)) {
                        // Remover a venda do banco de dados
                        remove(ref(db, `sales/${saleId}`))
                            .then(() => {
                                alert('Pedido excluído com sucesso!');
                            })
                            .catch(error => {
                                console.error('Erro ao excluir pedido:', error);
                                alert(`Erro ao excluir pedido: ${error.message}`);
                            });
                    }
                });
            });
            
            // Adicionar eventos aos selects de status
            document.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', () => {
                    const saleId = select.dataset.saleId;
                    const newStatus = select.value;
                    updateSaleStatus(saleId, newStatus);
                });
            });
        });
    }
    
    // Função para atualizar o status de uma venda
    function updateSaleStatus(saleId, newStatus) {
        const saleRef = ref(db, `sales/${saleId}`);
        
        // Obter a venda atual
        onValue(saleRef, (snapshot) => {
            const sale = snapshot.val();
            if (sale) {
                // Atualizar apenas o status
                set(saleRef, {
                    ...sale,
                    status: newStatus
                })
                .then(() => {
                    console.log(`Status da venda ${saleId} atualizado para ${newStatus}`);
                })
                .catch(error => {
                    console.error('Erro ao atualizar status da venda:', error);
                    alert(`Erro ao atualizar status: ${error.message}`);
                });
            }
        }, { onlyOnce: true });
    }
    
    // Função para exibir os detalhes de uma venda
    function showSaleDetails(sale) {
        // Criar modal
        const modal = document.createElement('div');
        modal.classList.add('sales-modal');
        
        // Formatar data
        const date = sale.timestamp 
            ? new Date(sale.timestamp).toLocaleString('pt-BR') 
            : 'Data não disponível';
        
        // Renderizar itens da venda
        let itemsHtml = '';
        if (sale.items && sale.items.length > 0) {
            sale.items.forEach(item => {
                // Garantir que o preço seja um número válido
                let price = 0;
                if (typeof item.price === 'number' && !isNaN(item.price)) {
                    price = item.price;
                } else if (typeof item.price === 'string') {
                    // Tentar converter string para número
                    const parsedPrice = parseFloat(item.price.replace(/[^\d,]/g, '').replace(',', '.'));
                    if (!isNaN(parsedPrice)) {
                        price = parsedPrice;
                    }
                }
                
                // Calcular subtotal
                const subtotal = price * item.quantity;
                
                itemsHtml += `
                    <div class="sales-modal-item">
                        <div class="sales-modal-item-info">
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
        
        modal.innerHTML = `
            <div class="sales-modal-content">
                <div class="sales-modal-header">
                    <h3>Detalhes do Pedido #${sale.orderNumber}</h3>
                    <button class="sales-modal-close">&times;</button>
                </div>
                
                <div class="sales-modal-customer">
                    <h4>Informações do Cliente</h4>
                    <p><strong>Nome:</strong> ${sale.customerName || 'Não informado'}</p>
                    <p><strong>Email:</strong> ${sale.customerEmail || sale.userEmail || 'Não informado'}</p>
                    <p><strong>Telefone:</strong> ${sale.customerPhone || 'Não informado'}</p>
                    <p><strong>Endereço:</strong> ${sale.customerAddress || 'Não informado'}</p>
                    <p><strong>Data do Pedido:</strong> ${date}</p>
                    <p><strong>Status:</strong> ${sale.status}</p>
                </div>
                
                <div class="sales-modal-items">
                    <h4>Itens do Pedido</h4>
                    ${itemsHtml}
                </div>
                
                <div class="sales-modal-total">
                    Total: R$ ${sale.total ? sale.total.toFixed(2) : '0.00'}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adicionar evento para fechar o modal
        modal.querySelector('.sales-modal-close').addEventListener('click', () => {
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
    
    // Carregar vendas inicialmente
    loadSales();
}

function setupProjectManager() {
    const db = getDatabase();
    const projectsRef = ref(db, 'projects');
    const projectsListAdmin = document.getElementById('projects-list-admin');
    const projectFormContainer = document.getElementById('project-form-container');
    const projectForm = document.getElementById('project-form');
    const addProjectBtn = document.getElementById('add-project-btn');
    const cancelProjectBtn = document.getElementById('cancel-project');

    // Mostrar formulário para adicionar novo projeto
    addProjectBtn.addEventListener('click', () => {
        // Limpar o formulário
        projectForm.reset();
        document.getElementById('project-id').value = '';
        projectFormContainer.style.display = 'block';
        addProjectBtn.style.display = 'none';
    });

    // Cancelar adição/edição de projeto
    cancelProjectBtn.addEventListener('click', () => {
        projectFormContainer.style.display = 'none';
        addProjectBtn.style.display = 'block';
    });

    // Salvar projeto (novo ou editado)
    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('project-title').value.trim();
        const description = document.getElementById('project-description').value.trim();
        const imageUrl = document.getElementById('project-image').value.trim();
        const progress = parseInt(document.getElementById('project-progress').value) || 0;
        const projectId = document.getElementById('project-id').value;
        
        const projectData = {
            title,
            description,
            imageUrl,
            progress: Math.min(100, Math.max(0, progress)) // Garantir que esteja entre 0 e 100
        };
        
        let projectRef;
        if (projectId) {
            // Editar projeto existente
            projectRef = ref(db, `projects/${projectId}`);
        } else {
            // Criar novo projeto
            projectRef = ref(db, `projects/${Date.now().toString()}`);
        }
        
        set(projectRef, projectData)
            .then(() => {
                projectFormContainer.style.display = 'none';
                addProjectBtn.style.display = 'block';
                alert(projectId ? 'Projeto atualizado com sucesso!' : 'Projeto adicionado com sucesso!');
            })
            .catch(error => {
                alert(`Erro ao salvar projeto: ${error.message}`);
            });
    });

    // Carregar projetos existentes
    onValue(projectsRef, (snapshot) => {
        projectsListAdmin.innerHTML = '';
        const projects = snapshot.val() || {};
        Object.entries(projects).forEach(([id, project]) => {
            const projectDiv = document.createElement('div');
            projectDiv.classList.add('admin-project-item');
            projectDiv.innerHTML = `
                <h4>${project.title}</h4>
                <div class="admin-project-buttons">
                    <button class="edit-btn" data-id="${id}">Editar</button>
                    <button class="delete-btn" data-id="${id}">Excluir</button>
                </div>
            `;
            projectsListAdmin.appendChild(projectDiv);
        });

        // Eventos de edição e exclusão
        document.querySelectorAll('#projects-list-admin .edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editProject(btn.dataset.id));
        });
        document.querySelectorAll('#projects-list-admin .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm(`Tem certeza que deseja excluir o projeto "${projects[btn.dataset.id].title}"?`)) {
                    remove(ref(db, `projects/${btn.dataset.id}`));
                    // Também remover a subpágina associada, se existir
                    remove(ref(db, `subpages/${btn.dataset.id}`));
                }
            });
        });
    });
}

function editProject(id) {
    const db = getDatabase();
    const projectRef = ref(db, `projects/${id}`);
    
    onValue(projectRef, (snapshot) => {
        const project = snapshot.val();
        if (project) {
            document.getElementById('project-title').value = project.title;
            document.getElementById('project-description').value = project.description;
            document.getElementById('project-image').value = project.imageUrl;
            document.getElementById('project-progress').value = project.progress;
            document.getElementById('project-id').value = id;
            
            document.getElementById('project-form-container').style.display = 'block';
            document.getElementById('add-project-btn').style.display = 'none';
        }
    }, { onlyOnce: true });
}

function setupProductManager() {
    const db = getDatabase();
    const productsRef = ref(db, 'products');
    const productsListAdmin = document.getElementById('products-list-admin');
    const productFormContainer = document.getElementById('product-form-container');
    const productForm = document.getElementById('product-form');
    const addProductBtn = document.getElementById('add-product-btn');
    const cancelProductBtn = document.getElementById('cancel-product');

    // Aplicar estilos inline para garantir que o botão tenha o mesmo estilo que o botão de adicionar projeto
    addProductBtn.style.background = 'linear-gradient(135deg, #4a90e2, #845ec2)';
    addProductBtn.style.color = 'white';
    addProductBtn.style.border = 'none';
    addProductBtn.style.padding = '8px 15px';
    addProductBtn.style.borderRadius = '5px';
    addProductBtn.style.cursor = 'pointer';
    addProductBtn.style.fontWeight = 'bold';
    addProductBtn.style.marginBottom = '15px';
    addProductBtn.style.transition = 'all 0.3s ease';
    addProductBtn.style.position = 'static';
    addProductBtn.style.overflow = 'hidden';

    // Adicionar eventos para o hover do botão
    addProductBtn.addEventListener('mouseover', () => {
        addProductBtn.style.transform = 'translateY(-2px)';
        addProductBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    });
    
    addProductBtn.addEventListener('mouseout', () => {
        addProductBtn.style.transform = 'none';
        addProductBtn.style.boxShadow = 'none';
    });

    // Aplicar estilos inline ao container do formulário de produto
    productFormContainer.style.background = 'rgba(0, 0, 0, 0.3)';
    productFormContainer.style.padding = '15px';
    productFormContainer.style.borderRadius = '8px';
    productFormContainer.style.margin = '15px 0';

    // Mostrar formulário para adicionar novo produto
    addProductBtn.addEventListener('click', () => {
        // Limpar o formulário
        productForm.reset();
        document.getElementById('product-id').value = '';
        productFormContainer.style.display = 'block';
        addProductBtn.style.display = 'none';
    });

    // Cancelar adição/edição de produto
    cancelProductBtn.addEventListener('click', () => {
        productFormContainer.style.display = 'none';
        addProductBtn.style.display = 'block';
    });

    // Salvar produto (novo ou editado)
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('product-title').value.trim();
        const description = document.getElementById('product-description').value.trim();
        const price = document.getElementById('product-price').value.trim();
        const imageUrl = document.getElementById('product-image').value.trim();
        const link = document.getElementById('product-link').value.trim();
        const productId = document.getElementById('product-id').value;
        
        const productData = {
            title,
            description,
            price,
            imageUrl,
            link
        };
        
        let productRef;
        if (productId) {
            // Editar produto existente
            productRef = ref(db, `products/${productId}`);
        } else {
            // Criar novo produto
            productRef = ref(db, `products/${Date.now().toString()}`);
        }
        
        set(productRef, productData)
            .then(() => {
                productFormContainer.style.display = 'none';
                addProductBtn.style.display = 'block';
                alert(productId ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
            })
            .catch(error => {
                alert(`Erro ao salvar produto: ${error.message}`);
            });
    });

    // Carregar produtos existentes
    onValue(productsRef, (snapshot) => {
        productsListAdmin.innerHTML = '';
        const products = snapshot.val() || {};
        Object.entries(products).forEach(([id, product]) => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('admin-project-item');
            productDiv.innerHTML = `
                <h4>${product.title} - R$ ${product.price}</h4>
                <div class="admin-project-buttons">
                    <button class="edit-btn" data-id="${id}">Editar</button>
                    <button class="delete-btn" data-id="${id}">Excluir</button>
                </div>
            `;
            productsListAdmin.appendChild(productDiv);
        });

        // Eventos de edição e exclusão
        document.querySelectorAll('#products-list-admin .edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editProduct(btn.dataset.id));
        });
        document.querySelectorAll('#products-list-admin .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm(`Tem certeza que deseja excluir o produto "${products[btn.dataset.id].title}"?`)) {
                    remove(ref(db, `products/${btn.dataset.id}`));
                }
            });
        });
    });
}

function editProduct(id) {
    const db = getDatabase();
    const productRef = ref(db, `products/${id}`);
    
    onValue(productRef, (snapshot) => {
        const product = snapshot.val();
        if (product) {
            document.getElementById('product-title').value = product.title;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-image').value = product.imageUrl;
            document.getElementById('product-link').value = product.link;
            document.getElementById('product-id').value = id;
            
            document.getElementById('product-form-container').style.display = 'block';
            document.getElementById('add-product-btn').style.display = 'none';
        }
    }, { onlyOnce: true });
}

function setupSubpageEditor() {
    const db = getDatabase();
    const subpageSelect = document.getElementById('subpage-select');
    const subpageEditor = document.getElementById('subpage-editor');
    const typeRadios = document.querySelectorAll('input[name="subpage-type"]');

    // Função para carregar itens no select com base no tipo selecionado
    function loadItemsForType(type) {
        const itemsRef = type === 'project' ? ref(db, 'projects') : ref(db, 'products');
        
        onValue(itemsRef, (snapshot) => {
            subpageSelect.innerHTML = '<option value="">Selecione um item</option>';
            const items = snapshot.val() || {};
            Object.entries(items).forEach(([id, item]) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = item.title;
                subpageSelect.appendChild(option);
            });
        });
    }

    // Inicializar com projetos (padrão)
    loadItemsForType('project');

    // Alternar entre projetos e produtos
    typeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            loadItemsForType(e.target.value);
            subpageEditor.innerHTML = ''; // Limpar o editor
        });
    });

    // Configurar o editor Quill quando um item for selecionado
    subpageSelect.addEventListener('change', (e) => {
        const itemId = e.target.value;
        if (!itemId) {
            subpageEditor.innerHTML = '';
            return;
        }

        // Determinar o tipo de subpágina (projeto ou produto)
        const type = document.querySelector('input[name="subpage-type"]:checked').value;
        const subpageCollection = type === 'project' ? 'subpages' : 'productSubpages';

        // Limpar o conteúdo anterior
        subpageEditor.innerHTML = `
            <div class="subpage-editor-container">
                <div id="editor-container">
                    <!-- O Quill será inicializado aqui -->
                </div>
                <div class="subpage-editor-buttons">
                    <button id="save-subpage">Salvar Subpágina</button>
                </div>
            </div>
        `;

        // Inicializar o Quill
        const quill = new Quill('#editor-container', {
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                ]
            },
            placeholder: 'Escreva o conteúdo da subpágina aqui...',
            theme: 'snow'
        });

        // Carregar conteúdo existente
        const subpageRef = ref(db, `${subpageCollection}/${itemId}`);
        onValue(subpageRef, (snapshot) => {
            const subpage = snapshot.val();
            if (subpage && subpage.content) {
                quill.root.innerHTML = DOMPurify.sanitize(subpage.content);
            }
        }, { onlyOnce: true });

        // Salvar subpágina
        document.getElementById('save-subpage').addEventListener('click', () => {
            const content = DOMPurify.sanitize(quill.root.innerHTML);
            const itemType = type === 'project' ? 'projectId' : 'productId';
            
            set(subpageRef, { [itemType]: itemId, content })
                .then(() => {
                    alert('Subpágina salva com sucesso!');
                })
                .catch(error => {
                    alert(`Erro ao salvar subpágina: ${error.message}`);
                });
        });
    });
}