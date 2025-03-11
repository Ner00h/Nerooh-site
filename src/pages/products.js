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

    // Função para criar um card de produto
    function createProductCard(title, description, price, imageUrl, link) {
        const card = document.createElement("div");
        card.classList.add("product-card");

        const productImage = document.createElement("div");
        productImage.classList.add("product-image");
        if (imageUrl) {
            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = title;
            productImage.appendChild(img);
        } else {
            productImage.textContent = "📦";
        }
        card.appendChild(productImage);

        const productInfo = document.createElement("div");
        productInfo.classList.add("product-info");

        const productTitle = document.createElement("h3");
        productTitle.textContent = title;
        productInfo.appendChild(productTitle);

        const productDesc = document.createElement("p");
        productDesc.textContent = description;
        productInfo.appendChild(productDesc);

        const productPrice = document.createElement("div");
        productPrice.classList.add("product-price");
        productPrice.textContent = price;
        productInfo.appendChild(productPrice);

        if (link) {
            const buyButton = document.createElement("a");
            buyButton.href = link;
            buyButton.classList.add("buy-button");
            buyButton.textContent = "Comprar";
            buyButton.target = "_blank";
            productInfo.appendChild(buyButton);
        }

        card.appendChild(productInfo);
        productsList.appendChild(card);
    }

    // Adicionar produtos
    const products = [
        {
            title: "Filamento PLA+",
            description: "Filamento de alta qualidade para impressões 3D.",
            price: "R$ 89,90",
            imageUrl: null,
            link: null
        },
        {
            title: "Impressora 3D Custom",
            description: "Impressora personalizada para projetos avançados.",
            price: "R$ 2.499,00",
            imageUrl: null,
            link: null
        },
        {
            title: "Kit de Ferramentas",
            description: "Ferramentas essenciais para manutenção de impressoras.",
            price: "R$ 149,90",
            imageUrl: null,
            link: null
        }
    ];

    products.forEach(product => {
        createProductCard(
            product.title,
            product.description,
            product.price,
            product.imageUrl,
            product.link
        );
    });

    productsContainer.appendChild(productsList);
    contentDiv.appendChild(productsContainer);

    // Posicionamento inicial centralizado como em contact.js
    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight : 0;
    const baseX = window.innerWidth / 2 - productsContainer.offsetWidth / 2;
    const baseY = headerHeight + 5; // Logo abaixo do header

    productsContainer.style.position = "absolute";
    productsContainer.style.left = baseX + "px";
    productsContainer.style.top = baseY + "px";
    productsContainer.dataset.baseX = baseX;
    productsContainer.dataset.baseY = baseY;

    return {
        cleanup: () => productsContainer.remove(),
        elements: { productsContainer }
    };
}