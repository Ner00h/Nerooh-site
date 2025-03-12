import { getDatabase, ref, onValue, set, remove } from 'firebase/database';
import { isAdmin } from '../core/auth.js';
import Quill from 'quill';
import DOMPurify from 'dompurify';

export function renderAdminPage(contentDiv) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    const adminPanel = document.createElement('div');
    adminPanel.classList.add('admin-panel');
    adminPanel.innerHTML = `
        <h2>Painel de Administração</h2>
        
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

    // Posicionamento fixo (sem movimento para economizar processamento)
    const baseX = window.innerWidth / 2 - adminPanel.offsetWidth / 2;
    const headerHeight = document.getElementById('header').offsetHeight;
    const baseY = headerHeight + 20;
    adminPanel.style.position = "absolute";
    adminPanel.style.left = baseX + 'px';
    adminPanel.style.top = baseY + 'px';
    
    // Não adicionamos dataset.baseX e dataset.baseY para evitar movimento

    // Configurar gerenciadores
    setupProjectManager();
    setupProductManager();
    setupSubpageEditor();

    // Adicionar evento de redimensionamento da janela
    function adjustContainerPosition() {
        const updatedBaseX = window.innerWidth / 2 - adminPanel.offsetWidth / 2;
        adminPanel.style.left = updatedBaseX + 'px';
    }
    
    window.addEventListener('resize', adjustContainerPosition);

    return {
        cleanup: () => {
            adminPanel.remove();
            window.removeEventListener('resize', adjustContainerPosition);
        },
        elements: {} // Retornar um objeto elements vazio para que o container não seja adicionado ao dynamicElements
    };
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
        if (!project) return;
        
        // Preencher o formulário com os dados do projeto
        document.getElementById('project-title').value = project.title || '';
        document.getElementById('project-description').value = project.description || '';
        document.getElementById('project-image').value = project.imageUrl || '';
        document.getElementById('project-progress').value = project.progress || 0;
        document.getElementById('project-id').value = id;
        
        // Mostrar o formulário
        document.getElementById('project-form-container').style.display = 'block';
        document.getElementById('add-project-btn').style.display = 'none';
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
            imageUrl: imageUrl || null,
            link: link || null
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
            productDiv.classList.add('admin-project-item'); // Reutilizando o estilo dos projetos
            productDiv.innerHTML = `
                <h4>${product.title} - ${product.price}</h4>
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
                    // Também remover a subpágina associada, se existir
                    remove(ref(db, `productSubpages/${btn.dataset.id}`));
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
        if (!product) return;
        
        // Preencher o formulário com os dados do produto
        document.getElementById('product-title').value = product.title || '';
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price || '';
        document.getElementById('product-image').value = product.imageUrl || '';
        document.getElementById('product-link').value = product.link || '';
        document.getElementById('product-id').value = id;
        
        // Mostrar o formulário
        document.getElementById('product-form-container').style.display = 'block';
        document.getElementById('add-product-btn').style.display = 'none';
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
