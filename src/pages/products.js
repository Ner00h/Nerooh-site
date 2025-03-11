export function renderProductsPage(contentDiv) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    const productsContainer = document.createElement("div");
    productsContainer.classList.add("products-container");
    
    // Reduzindo ainda mais o padding e a margem para ficar no limite do header
    productsContainer.style.paddingTop = "5px";
    productsContainer.style.marginTop = "5px";

    // Título da página
    const title = document.createElement("h1");
    title.textContent = "Meus Produtos";
    title.classList.add("products-title");
    productsContainer.appendChild(title);

    // Descrição
    const description = document.createElement("p");
    description.textContent = "Confira os produtos e serviços que ofereço.";
    description.classList.add("products-description");
    productsContainer.appendChild(description);

    // Lista de produtos
    const productsList = document.createElement("div");
    productsList.classList.add("products-list");

    // Função para criar um card de produto
    function createProductCard(title, description, price, imageUrl, buyLink) {
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
            productImage.textContent = "🛒";
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
        productPrice.textContent = `R$ ${price.toFixed(2)}`;
        productInfo.appendChild(productPrice);

        if (buyLink) {
            const buyButton = document.createElement("a");
            buyButton.href = buyLink;
            buyButton.textContent = "Comprar";
            buyButton.classList.add("buy-button");
            buyButton.target = "_blank";
            productInfo.appendChild(buyButton);
        }

        card.appendChild(productInfo);
        return card;
    }

    // Adicionar alguns produtos de exemplo
    const products = [
        {
            title: "Consultoria em Desenvolvimento Web",
            description: "Consultoria personalizada para desenvolvimento de sites e aplicações web.",
            price: 150.00,
            imageUrl: null,
            buyLink: "/contato"
        },
        {
            title: "Modelo 3D Personalizado",
            description: "Criação de modelos 3D personalizados para impressão.",
            price: 80.00,
            imageUrl: null,
            buyLink: "/contato"
        },
        {
            title: "Curso de JavaScript Básico",
            description: "Curso online com 10 horas de conteúdo sobre JavaScript para iniciantes.",
            price: 49.90,
            imageUrl: null,
            buyLink: null
        },
        {
            title: "Hospedagem de Site",
            description: "Serviço de hospedagem para seu site ou aplicação web.",
            price: 29.90,
            imageUrl: null,
            buyLink: "/contato"
        }
    ];

    // Adicionar os produtos à lista
    products.forEach(product => {
        const card = createProductCard(
            product.title,
            product.description,
            product.price,
            product.imageUrl,
            product.buyLink
        );
        productsList.appendChild(card);
    });

    productsContainer.appendChild(productsList);
    contentDiv.appendChild(productsContainer);

    // Posicionamento
    const baseX = window.innerWidth / 2 - productsContainer.offsetWidth / 2;
    
    // Obtendo a altura do header para um posicionamento mais preciso
    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight : 0;
    
    // Calculando a posição vertical para ficar exatamente abaixo do header
    const baseY = headerHeight + 5; // Apenas 5px de margem para ficar bem no limite
    
    productsContainer.style.left = baseX + "px";
    productsContainer.style.top = baseY + "px";
    productsContainer.dataset.baseX = baseX;
    productsContainer.dataset.baseY = baseY;

    return {
        cleanup: () => productsContainer.remove(),
        elements: { productsContainer }
    };
} 