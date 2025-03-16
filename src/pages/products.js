import { getDatabase, ref, onValue } from 'firebase/database';
import { addToCart, renderMiniCart, getCart, onCartUpdate } from '../core/cart.js';

export function renderProductsPage(contentDiv) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    const productsContainer = document.createElement("div");
    productsContainer.classList.add("products-container");
    productsContainer.style.paddingTop = "5px";
    productsContainer.style.marginTop = "5px";

    // Título da página
    const title = document.createElement("h1");
    title.textContent = "Produtos";
    title.classList.add("products-title");
    productsContainer.appendChild(title);

    // Descrição
    const description = document.createElement("p");
    description.textContent = "Confira os produtos disponíveis para compra.";
    description.classList.add("products-description");
    productsContainer.appendChild(description);

    // Lista de produtos
    const productsList = document.createElement("div");
    productsList.classList.add("products-list");
    productsContainer.appendChild(productsList);
    
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
        productsList.innerHTML = ''; // Limpar lista antes de adicionar produtos
        
        const products = snapshot.val() || {};
        
        if (Object.keys(products).length === 0) {
            // Se não houver produtos, mostrar mensagem
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent = "Nenhum produto disponível no momento.";
            emptyMessage.style.textAlign = "center";
            emptyMessage.style.padding = "20px";
            productsList.appendChild(emptyMessage);
        } else {
            // Adicionar produtos do Firebase
            Object.entries(products).forEach(([id, product]) => {
                createProductCard(id, product);
            });
        }
        
        // Ajustar posição após o carregamento dos dados
        // Isso garante que o container esteja centralizado mesmo após adicionar conteúdo
        setTimeout(adjustContainerPosition, 100);
    });

    // Função para criar um card de produto
    function createProductCard(id, product) {
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
        productsList.appendChild(card);
    }

    return {
        cleanup: () => {
            productsContainer.remove();
            miniCart.remove();
        },
        elements: { productsContainer }
    };
}