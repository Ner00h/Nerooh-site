import { getDatabase, ref, onValue } from 'firebase/database';
import { addToCart, renderMiniCart, getCart, onCartUpdate } from '../core/cart.js';

export function renderProductsPage(contentDiv) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    const productsContainer = document.createElement("div");
    productsContainer.classList.add("products-container");
    productsContainer.style.paddingTop = "5px";
    productsContainer.style.marginTop = "5px";
    productsContainer.style.maxWidth = "800px"; // Definir largura máxima
    productsContainer.style.width = "90%"; // Garantir responsividade
    productsContainer.style.overflowX = "hidden"; // Evitar overflow horizontal

    // Lista de produtos
    const productsList = document.createElement("div");
    productsList.classList.add("products-list");
    
    // Criar containers separados para cada classificação
    const neroohContainer = document.createElement("div");
    neroohContainer.classList.add("nerooh-products");
    const neroohTitle = document.createElement("h2");
    neroohTitle.textContent = "Produtos Nerooh Std";
    neroohTitle.classList.add("classification-title");
    neroohContainer.appendChild(neroohTitle);
    
    const eriContainer = document.createElement("div");
    eriContainer.classList.add("eri-products");
    const eriTitle = document.createElement("h2");
    eriTitle.textContent = "Produtos Eri Store";
    eriTitle.classList.add("classification-title");
    eriContainer.appendChild(eriTitle);
    
    productsList.appendChild(neroohContainer);
    productsList.appendChild(eriContainer);
    productsContainer.appendChild(productsList);
    
    // Adicionar estilos para as seções
    const style = document.createElement('style');
    style.textContent = `
        .classification-title {
            color: #fff;
            font-size: 1.6em;
            margin: 15px 0 10px;
            text-align: center;
            padding-bottom: 5px;
            border-bottom: 2px solid rgba(100, 100, 255, 0.3);
            width: 100%;
        }
        
        .classification-title img {
            vertical-align: middle;
            margin-left: 10px;
        }
        
        .nerooh-logo {
            height: 60px;
        }
        
        .eri-logo {
            height: 120px;
        }
        
        .nerooh-products, .eri-products {
            margin-bottom: 20px;
            width: 100%;
        }
        
        /* Estilos específicos para produtos Eri Store */
        .eri-products .product-card {
            background: rgba(255, 192, 203, 0.15);
            border: 1px solid rgba(255, 182, 193, 0.3);
            transition: all 0.3s ease;
        }

        .eri-products .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(255, 182, 193, 0.3);
            border-color: rgba(255, 182, 193, 0.6);
        }

        .eri-products .product-info h3 {
            color: #FFB6C1;
            font-family: 'Playfair Display', serif;
        }

        .eri-products .product-price {
            color: #FF69B4;
        }

        .eri-products .view-more-btn {
            background-color: #FFB6C1;
            color: #4A4A4A;
        }

        .eri-products .view-more-btn:hover {
            background-color: #FF69B4;
            color: white;
        }

        .eri-products .add-to-cart-btn {
            background-color: #FF69B4;
            color: white;
        }

        .eri-products .add-to-cart-btn:hover {
            background-color: #FF1493;
        }

        .eri-products .buy-button {
            background-color: #FF1493;
        }

        .eri-products .buy-button:hover {
            background-color: #FF69B4;
        }

        .eri-products .product-image {
            background: rgba(255, 192, 203, 0.1);
        }
        
        .products-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            padding: 10px;
        }
        
        .products-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
        }

        .product-card {
            background: rgba(30, 30, 50, 0.7);
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid rgba(100, 100, 255, 0.3);
            width: 100%;
            max-width: 280px;
            margin: 0 auto;
        }

        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .product-image {
            width: 100%;
            height: 180px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(20, 20, 40, 0.8);
        }

        .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .product-info {
            padding: 8px;
        }

        .product-info h3 {
            margin: 0 0 4px;
            color: #fff;
            font-size: 1em;
        }

        .product-info p {
            margin: 0 0 8px;
            color: #ccc;
            font-size: 0.85em;
            line-height: 1.2;
        }

        .product-price {
            font-size: 1.1em;
            color: #5a5aff;
            margin: 4px 0;
            font-weight: bold;
        }

        .view-more-btn, .add-to-cart-btn, .buy-button {
            display: inline-block;
            padding: 5px 10px;
            margin: 2px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85em;
            text-decoration: none;
            transition: background-color 0.3s ease;
        }

        .view-more-btn {
            background-color: #3a3a8c;
            color: white;
        }

        .view-more-btn:hover {
            background-color: #4a4aac;
        }

        .add-to-cart-btn {
            background-color: #5a5aff;
            color: white;
            width: auto;
        }

        .add-to-cart-btn:hover {
            background-color: #6b6bff;
        }

        .buy-button {
            background-color: #4CAF50;
            color: white;
        }

        .buy-button:hover {
            background-color: #45a049;
        }

        @media (max-width: 1024px) {
            .products-grid {
                grid-template-columns: repeat(3, 1fr);
            }

            .product-card {
                max-width: 260px;
            }
        }

        @media (max-width: 768px) {
            .products-grid {
                grid-template-columns: repeat(2, 1fr);
                padding: 10px;
            }

            .product-card {
                max-width: 240px;
            }

            .product-image {
                height: 160px;
            }

            .classification-title {
                font-size: 1.4em;
                margin: 20px 0 15px;
            }
        }

        @media (max-width: 480px) {
            .products-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }

            .product-card {
                max-width: 180px;
            }

            .classification-title {
                font-size: 1.2em;
            }

            .product-image {
                height: 120px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Adicionar o container ao DOM antes de carregar os dados
    contentDiv.appendChild(productsContainer);
    
    // Posicionamento inicial centralizado - definido ANTES do carregamento dos dados
    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight : 0;
    const baseX = window.innerWidth / 2 - productsContainer.offsetWidth / 2;
    const baseY = headerHeight + 5; // Logo abaixo do header

    productsContainer.style.position = "absolute";
    productsContainer.style.left = baseX + "px";
    productsContainer.style.top = baseY + "px";
    productsContainer.dataset.baseX = baseX;
    productsContainer.dataset.baseY = baseY;

    // Renderizar o mini-carrinho
    const miniCart = renderMiniCart(contentDiv);
    
    // Inicialmente ocultar o mini-carrinho
    miniCart.style.display = 'none';
    
    // Obter o ícone do carrinho existente
    const cartIcon = document.querySelector('.cart-icon');
    
    // Função para ajustar a posição do container
    function adjustContainerPosition() {
        const updatedBaseX = window.innerWidth / 2 - productsContainer.offsetWidth / 2;
        productsContainer.style.left = updatedBaseX + "px";
        productsContainer.dataset.baseX = updatedBaseX;
    }

    // Ajustar posição após um curto período para garantir que o DOM foi renderizado
    setTimeout(adjustContainerPosition, 50);

    // Carregar produtos do Firebase
    const db = getDatabase();
    const productsRef = ref(db, 'products');
    
    onValue(productsRef, (snapshot) => {
        // Criar título com logo para Nerooh
        const neroohTitleHtml = document.createElement('h2');
        neroohTitleHtml.classList.add('classification-title');
        neroohTitleHtml.innerHTML = `Produtos <img src="/logo.svg" alt="Nerooh Logo" class="nerooh-logo">`;
        neroohContainer.innerHTML = '';
        neroohContainer.appendChild(neroohTitleHtml);

        // Criar título com logo para Eri Store
        const eriTitleHtml = document.createElement('h2');
        eriTitleHtml.classList.add('classification-title');
        eriTitleHtml.innerHTML = `Produtos <img src="/logoEri.png" alt="Eri Store Logo" class="eri-logo">`;
        eriContainer.innerHTML = '';
        eriContainer.appendChild(eriTitleHtml);
        
        // Criar containers de grid para os produtos
        const neroohGrid = document.createElement('div');
        neroohGrid.classList.add('products-grid');
        neroohContainer.appendChild(neroohGrid);
        
        const eriGrid = document.createElement('div');
        eriGrid.classList.add('products-grid');
        eriContainer.appendChild(eriGrid);
        
        const products = snapshot.val() || {};
        
        // Separar produtos por classificação
        const neroohProducts = {};
        const eriProducts = {};
        
        Object.entries(products).forEach(([id, product]) => {
            if (product.classification === 'eri') {
                eriProducts[id] = product;
            } else {
                // Se não tiver classificação ou for 'nerooh'
                neroohProducts[id] = product;
            }
        });
        
        if (Object.keys(neroohProducts).length === 0 && Object.keys(eriProducts).length === 0) {
            // Se não houver produtos em nenhuma categoria
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent = "Nenhum produto disponível no momento.";
            emptyMessage.style.textAlign = "center";
            emptyMessage.style.padding = "20px";
            neroohGrid.appendChild(emptyMessage.cloneNode(true));
            eriGrid.appendChild(emptyMessage);
        } else {
            // Adicionar produtos Nerooh
            if (Object.keys(neroohProducts).length === 0) {
                const emptyNerooh = document.createElement("p");
                emptyNerooh.textContent = "Nenhum produto Nerooh Std disponível no momento.";
                emptyNerooh.style.textAlign = "center";
                emptyNerooh.style.padding = "20px";
                neroohGrid.appendChild(emptyNerooh);
            } else {
                Object.entries(neroohProducts).forEach(([id, product]) => {
                    createProductCard(id, product, neroohGrid);
                });
            }
            
            // Adicionar produtos Eri Store
            if (Object.keys(eriProducts).length === 0) {
                const emptyEri = document.createElement("p");
                emptyEri.textContent = "Nenhum produto Eri Store disponível no momento.";
                emptyEri.style.textAlign = "center";
                emptyEri.style.padding = "20px";
                eriGrid.appendChild(emptyEri);
            } else {
                Object.entries(eriProducts).forEach(([id, product]) => {
                    createProductCard(id, product, eriGrid);
                });
            }
        }
        
        // Ajustar posição após o carregamento dos dados
        setTimeout(adjustContainerPosition, 100);
    });

    // Função para criar um card de produto
    function createProductCard(id, product, container) {
        const card = document.createElement("div");
        card.classList.add("product-card");

        const productImage = document.createElement("div");
        productImage.classList.add("product-image");
        if (product.imageUrl) {
            const img = document.createElement("img");
            img.src = product.imageUrl;
            img.alt = product.title;
            productImage.appendChild(img);
        } else {
            productImage.textContent = "📦";
        }
        card.appendChild(productImage);

        const productInfo = document.createElement("div");
        productInfo.classList.add("product-info");

        const productTitle = document.createElement("h3");
        productTitle.textContent = product.title;
        productInfo.appendChild(productTitle);

        const productDesc = document.createElement("p");
        productDesc.textContent = product.description;
        productInfo.appendChild(productDesc);

        const productPrice = document.createElement("div");
        productPrice.classList.add("product-price");
        productPrice.textContent = product.price || "Preço sob consulta";
        productInfo.appendChild(productPrice);

        // Botão para ver detalhes do produto
        const detailsButton = document.createElement("a");
        detailsButton.href = `/produtos/${id}`;
        detailsButton.classList.add("view-more-btn");
        detailsButton.textContent = "Ver detalhes";
        detailsButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Rolar a página para o topo antes de mudar de rota
            window.scrollTo(0, 0);
            
            history.pushState({ page: 'productDetail', id }, null, `/produtos/${id}`);
            window.dispatchEvent(new Event('route-change'));
        });
        productInfo.appendChild(detailsButton);

        // Botão de adicionar ao carrinho
        const addToCartButton = document.createElement("button");
        addToCartButton.classList.add("add-to-cart-btn");
        addToCartButton.textContent = "Adicionar ao Carrinho";
        addToCartButton.addEventListener('click', () => {
            // Adicionar o produto ao carrinho com o ID
            addToCart({
                id,
                title: product.title,
                price: product.price,
                imageUrl: product.imageUrl
            });
            
            // Mostrar o mini-carrinho após adicionar um produto
            miniCart.style.display = 'flex';
            
            // Ocultar o mini-carrinho após 3 segundos
            setTimeout(() => {
                miniCart.style.display = 'none';
            }, 3000);
            
            // Garantir que o botão do carrinho esteja visível em todas as páginas após adicionar um produto
            if (window.updateCartIconVisibility) {
                window.updateCartIconVisibility();
            }
        });
        productInfo.appendChild(addToCartButton);

        // Botão de compra, se houver link
        if (product.link) {
            const buyButton = document.createElement("a");
            buyButton.href = product.link;
            buyButton.classList.add("buy-button");
            buyButton.textContent = "Comprar";
            buyButton.target = "_blank";
            productInfo.appendChild(buyButton);
        }

        card.appendChild(productInfo);
        container.appendChild(card);
    }

    return {
        cleanup: () => {
            productsContainer.remove();
            miniCart.remove();
        },
        elements: { productsContainer }
    };
}