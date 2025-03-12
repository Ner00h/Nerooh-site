import { getDatabase, ref, onValue } from 'firebase/database';
import DOMPurify from 'dompurify';

export function renderProductDetailPage(contentDiv, productId) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    // Container principal
    const productDetailContainer = document.createElement("div");
    productDetailContainer.classList.add("product-detail-container");
    contentDiv.appendChild(productDetailContainer);

    // Posicionamento inicial
    const baseX = window.innerWidth / 2 - productDetailContainer.offsetWidth / 2;
    const headerHeight = document.getElementById('header').offsetHeight;
    const baseY = headerHeight + 20;
    productDetailContainer.style.position = "absolute";
    productDetailContainer.style.left = baseX + 'px';
    productDetailContainer.style.top = baseY + 'px';
    productDetailContainer.dataset.baseX = baseX;
    productDetailContainer.dataset.baseY = baseY;

    // Função para ajustar a posição do container
    function adjustContainerPosition() {
        const updatedBaseX = window.innerWidth / 2 - productDetailContainer.offsetWidth / 2;
        productDetailContainer.style.left = updatedBaseX + 'px';
        productDetailContainer.dataset.baseX = updatedBaseX;
    }

    // Ajustar posição após um curto período para garantir que o DOM foi renderizado
    setTimeout(adjustContainerPosition, 50);

    // Carregar dados do produto do Firebase
    const db = getDatabase();
    const productRef = ref(db, `products/${productId}`);
    const subpageRef = ref(db, `productSubpages/${productId}`);

    onValue(productRef, (productSnapshot) => {
        const product = productSnapshot.val();
        if (!product) {
            // Se o produto não for encontrado, exibir mensagem de erro
            productDetailContainer.innerHTML = `
                <h1>Produto não encontrado</h1>
                <p>O produto que você está procurando não existe.</p>
                <button id="back-to-products" class="back-button">Voltar para Produtos</button>
            `;
            
            // Adicionar evento ao botão de voltar
            document.getElementById("back-to-products").addEventListener("click", () => {
                history.pushState({ page: 'products' }, null, '/produtos');
                window.dispatchEvent(new Event('route-change'));
            });
            
            // Ajustar posição após carregar o conteúdo de erro
            setTimeout(adjustContainerPosition, 100);
            
            return;
        }

        // Carregar subpágina, se existir
        onValue(subpageRef, (subpageSnapshot) => {
            const subpage = subpageSnapshot.val() || {};
            
            // Construir a interface do produto
            productDetailContainer.innerHTML = `
                <button class="back-button">← Voltar para Produtos</button>
                <div class="product-detail-header">
                    <h1 class="product-detail-title">${product.title}</h1>
                    <div class="product-detail-price">
                        <span>${product.price || 'Preço sob consulta'}</span>
                    </div>
                </div>
            `;

            // Adicionar imagem se existir
            if (product.imageUrl) {
                const singleImage = document.createElement("div");
                singleImage.classList.add("product-detail-single-image");
                
                const img = document.createElement("img");
                img.src = product.imageUrl;
                img.alt = product.title;
                singleImage.appendChild(img);
                
                productDetailContainer.appendChild(singleImage);
            }

            // Informações detalhadas
            const infoSection = document.createElement("div");
            infoSection.classList.add("product-detail-info");
            
            // Descrição
            const description = document.createElement("div");
            description.classList.add("product-detail-description");
            
            const descTitle = document.createElement("h2");
            descTitle.textContent = "Descrição";
            description.appendChild(descTitle);
            
            const descText = document.createElement("p");
            descText.textContent = product.description;
            description.appendChild(descText);
            
            infoSection.appendChild(description);

            // Botão de compra
            if (product.link) {
                const buySection = document.createElement("div");
                buySection.classList.add("product-detail-buy");
                
                const buyButton = document.createElement("a");
                buyButton.href = product.link;
                buyButton.target = "_blank";
                buyButton.classList.add("buy-button", "large");
                buyButton.textContent = "Comprar Agora";
                
                buySection.appendChild(buyButton);
                infoSection.appendChild(buySection);
            }

            // Conteúdo da subpágina
            const contentSection = document.createElement("div");
            contentSection.classList.add("product-detail-content");
            
            const contentTitle = document.createElement("h2");
            contentTitle.textContent = "Detalhes do Produto";
            contentSection.appendChild(contentTitle);
            
            const contentDiv = document.createElement("div");
            contentDiv.classList.add("product-detail-content-html");
            
            // Sanitizar o HTML antes de injetá-lo no DOM
            const sanitizedContent = subpage.content 
                ? DOMPurify.sanitize(subpage.content) 
                : 'Nenhum detalhe adicional disponível.';
                
            contentDiv.innerHTML = sanitizedContent;
            contentSection.appendChild(contentDiv);
            
            infoSection.appendChild(contentSection);
            
            productDetailContainer.appendChild(infoSection);

            // Evento do botão voltar
            productDetailContainer.querySelector('.back-button').addEventListener('click', () => {
                history.pushState({ page: 'products' }, null, '/produtos');
                window.dispatchEvent(new Event('route-change'));
            });

            // Ajustar posição após o carregamento completo do conteúdo
            setTimeout(adjustContainerPosition, 100);
        });
    });

    return {
        cleanup: () => productDetailContainer.remove(),
        elements: { productDetailContainer }
    };
} 