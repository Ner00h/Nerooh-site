export function renderHomePage(contentDiv) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    // Criar container para a página home
    const homeContainer = document.createElement("div");
    homeContainer.classList.add("home-container");
    contentDiv.appendChild(homeContainer);

    const introText = document.createElement("div");
    introText.classList.add("intro-text");
    const h1 = document.createElement("h1");
    h1.textContent = "Olá, Mundo!";
    const p = document.createElement("p");
    p.textContent = "Bem vindo ao meu canto na internet, aqui você Poderá acompanhar meus projetos, interagir com eles, contribuir, adquirir dos nossos produtos ou mesmo transformar a sua imaginação em objetos tangíveis.";
    introText.appendChild(h1);
    introText.appendChild(p);
    homeContainer.appendChild(introText);
    
    // Posicionamento inicial do texto
    function positionIntroText() {
        const baseX = window.innerWidth / 2 - introText.offsetWidth / 2;
        const baseY = window.innerHeight / 2 - introText.offsetHeight / 2;
        introText.style.position = "absolute";
        introText.style.left = baseX + "px";
        introText.style.top = baseY + "px";
        introText.dataset.baseX = baseX;
        introText.dataset.baseY = baseY;
    }
    
    positionIntroText();

    const introVideo = document.createElement("iframe");
    introVideo.classList.add("intro-video");
    introVideo.src = "https://www.youtube.com/embed/39Y0jPHpYd4?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playlist=39Y0jPHpYd4&start=0";
    introVideo.frameBorder = "0";
    introVideo.allow = "autoplay; encrypted-media";
    introVideo.allowFullscreen = true;
    homeContainer.appendChild(introVideo);
    
    // Posicionamento inicial do vídeo
    function positionIntroVideo() {
        const videoBaseX = window.innerWidth / 2 - (window.innerWidth * 0.9) / 2;
        const videoBaseY = window.innerHeight / 2 + 250;
        introVideo.style.position = "absolute";
        introVideo.style.left = videoBaseX + "px";
        introVideo.style.top = videoBaseY + "px";
        introVideo.dataset.baseX = videoBaseX;
        introVideo.dataset.baseY = videoBaseY;
    }
    
    positionIntroVideo();
    
    // Seção de destaques
    const highlightsSection = document.createElement("section");
    highlightsSection.classList.add("highlights-section");
    
    const highlightsContainer = document.createElement("div");
    highlightsContainer.classList.add("highlights-container");
    
    const highlightsTitle = document.createElement("h2");
    highlightsTitle.textContent = "Projetos em Destaque";
    highlightsContainer.appendChild(highlightsTitle);
    
    const highlights = [
        {
            title: "Reciclagem PET",
            description: "Transformando garrafas PET em filamento para impressão 3D e criando peças sustentáveis.",
            icon: "fas fa-recycle",
            link: "#projetos",
            dataPage: "projects"
        },
        {
            title: "Modelos 3D Artísticos",
            description: "Coleção de designs exclusivos disponíveis na plataforma Cults.",
            icon: "fas fa-cube",
            link: "#projetos",
            dataPage: "projects"
        },
        {
            title: "Controle Remoto",
            description: "Controle suas impressoras 3D remotamente através deste site.",
            icon: "fas fa-wifi",
            link: "#controle",
            dataPage: "control"
        }
    ];
    
    const highlightCards = document.createElement("div");
    highlightCards.classList.add("highlight-cards");
    
    highlights.forEach(highlight => {
        const card = document.createElement("div");
        card.classList.add("highlight-card");
        
        const iconContainer = document.createElement("div");
        iconContainer.classList.add("highlight-icon");
        const icon = document.createElement("i");
        icon.className = highlight.icon;
        iconContainer.appendChild(icon);
        
        const cardContent = document.createElement("div");
        cardContent.classList.add("highlight-content");
        
        const cardTitle = document.createElement("h3");
        cardTitle.textContent = highlight.title;
        
        const cardDescription = document.createElement("p");
        cardDescription.textContent = highlight.description;
        
        const cardLink = document.createElement("a");
        cardLink.href = highlight.link;
        cardLink.setAttribute("data-page", highlight.dataPage);
        cardLink.textContent = "Explorar";
        cardLink.classList.add("highlight-link");
        
        // Adicionar event listener para navegação
        cardLink.addEventListener('click', (e) => {
            e.preventDefault();
            const page = cardLink.getAttribute('data-page');
            const path = page === 'control' ? '/controle' : 
                         page === 'contact' ? '/contato' : 
                         page === 'projects' ? '/projetos' : 
                         page === 'products' ? '/produtos' :
                         page === 'admin' ? '/admin' : '/';
            history.pushState({ page }, null, path);
            window.dispatchEvent(new Event('route-change'));
        });
        
        cardContent.appendChild(cardTitle);
        cardContent.appendChild(cardDescription);
        cardContent.appendChild(cardLink);
        
        card.appendChild(iconContainer);
        card.appendChild(cardContent);
        
        highlightCards.appendChild(card);
    });
    
    highlightsContainer.appendChild(highlightCards);
    highlightsSection.appendChild(highlightsContainer);
    homeContainer.appendChild(highlightsSection);
    
    // Adicionar evento de redimensionamento da janela para a página inicial
    const resizeHandler = () => {
        positionIntroText();
        positionIntroVideo();
    };
    
    window.addEventListener('resize', resizeHandler);

    return {
        cleanup: () => {
            homeContainer.remove();
            window.removeEventListener('resize', resizeHandler);
        },
        elements: { introText, introVideo, highlightsSection }
    };
}