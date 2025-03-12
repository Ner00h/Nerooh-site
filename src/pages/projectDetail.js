export function renderProjectDetailPage(contentDiv, projectId) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    // Obter os dados do projeto com base no ID
    const project = getProjectById(projectId);
    
    if (!project) {
        // Se o projeto não for encontrado, exibir mensagem de erro
        const errorContainer = document.createElement("div");
        errorContainer.classList.add("error-container");
        errorContainer.innerHTML = `
            <h1>Projeto não encontrado</h1>
            <p>O projeto que você está procurando não existe.</p>
            <button id="back-to-projects">Voltar para Projetos</button>
        `;
        
        contentDiv.appendChild(errorContainer);
        
        // Adicionar evento ao botão de voltar
        document.getElementById("back-to-projects").addEventListener("click", () => {
            history.pushState({ page: 'projects' }, null, '/projetos');
            window.dispatchEvent(new Event('route-change'));
        });
        
        return {
            cleanup: () => errorContainer.remove(),
            elements: { errorContainer }
        };
    }

    // Container principal
    const detailContainer = document.createElement("div");
    detailContainer.classList.add("project-detail-container");
    
    // Botão de voltar
    const backButton = document.createElement("button");
    backButton.id = "back-to-projects";
    backButton.innerHTML = "← Voltar para Projetos";
    backButton.classList.add("back-button");
    backButton.addEventListener("click", () => {
        history.pushState({ page: 'projects' }, null, '/projetos');
        window.dispatchEvent(new Event('route-change'));
    });
    detailContainer.appendChild(backButton);
    
    // Cabeçalho do projeto
    const header = document.createElement("div");
    header.classList.add("project-detail-header");
    
    // Título
    const title = document.createElement("h1");
    title.textContent = project.title;
    title.classList.add("project-detail-title");
    header.appendChild(title);
    
    // Barra de progresso
    const progressContainer = document.createElement("div");
    progressContainer.classList.add("project-detail-progress-container");
    
    const progressText = document.createElement("span");
    progressText.textContent = `Progresso: ${project.progress}%`;
    progressContainer.appendChild(progressText);
    
    const progressBar = document.createElement("div");
    progressBar.classList.add("project-detail-progress-bar");
    progressBar.style.width = `${project.progress}%`;
    progressContainer.appendChild(progressBar);
    
    header.appendChild(progressContainer);
    detailContainer.appendChild(header);
    
    // Galeria de imagens
    if (project.images && project.images.length > 0) {
        const gallery = document.createElement("div");
        gallery.classList.add("project-detail-gallery");
        
        // Imagem principal
        const mainImageContainer = document.createElement("div");
        mainImageContainer.classList.add("project-detail-main-image");
        
        const mainImage = document.createElement("img");
        mainImage.src = project.images[0];
        mainImage.alt = `${project.title} - Imagem principal`;
        mainImageContainer.appendChild(mainImage);
        gallery.appendChild(mainImageContainer);
        
        // Miniaturas (se houver mais de uma imagem)
        if (project.images.length > 1) {
            const thumbnails = document.createElement("div");
            thumbnails.classList.add("project-detail-thumbnails");
            
            project.images.forEach((imgSrc, index) => {
                const thumb = document.createElement("div");
                thumb.classList.add("project-detail-thumbnail");
                if (index === 0) thumb.classList.add("active");
                
                const img = document.createElement("img");
                img.src = imgSrc;
                img.alt = `${project.title} - Miniatura ${index + 1}`;
                thumb.appendChild(img);
                
                // Evento para trocar a imagem principal
                thumb.addEventListener("click", () => {
                    mainImage.src = imgSrc;
                    // Atualizar classe ativa
                    document.querySelectorAll(".project-detail-thumbnail").forEach(t => t.classList.remove("active"));
                    thumb.classList.add("active");
                });
                
                thumbnails.appendChild(thumb);
            });
            
            gallery.appendChild(thumbnails);
        }
        
        detailContainer.appendChild(gallery);
    } else if (project.imageUrl) {
        // Se não tiver galeria mas tiver uma imagem principal
        const singleImage = document.createElement("div");
        singleImage.classList.add("project-detail-single-image");
        
        const img = document.createElement("img");
        img.src = project.imageUrl;
        img.alt = project.title;
        singleImage.appendChild(img);
        
        detailContainer.appendChild(singleImage);
    }
    
    // Informações detalhadas
    const infoSection = document.createElement("div");
    infoSection.classList.add("project-detail-info");
    
    // Descrição completa
    const description = document.createElement("div");
    description.classList.add("project-detail-description");
    
    const descTitle = document.createElement("h2");
    descTitle.textContent = "Descrição";
    description.appendChild(descTitle);
    
    const descText = document.createElement("p");
    descText.textContent = project.fullDescription || project.description;
    description.appendChild(descText);
    
    infoSection.appendChild(description);
    
    // Tecnologias utilizadas
    if (project.technologies && project.technologies.length > 0) {
        const techSection = document.createElement("div");
        techSection.classList.add("project-detail-technologies");
        
        const techTitle = document.createElement("h2");
        techTitle.textContent = "Tecnologias Utilizadas";
        techSection.appendChild(techTitle);
        
        const techList = document.createElement("ul");
        project.technologies.forEach(tech => {
            const techItem = document.createElement("li");
            techItem.textContent = tech;
            techList.appendChild(techItem);
        });
        techSection.appendChild(techList);
        
        infoSection.appendChild(techSection);
    }
    
    // Recursos/Funcionalidades
    if (project.features && project.features.length > 0) {
        const featuresSection = document.createElement("div");
        featuresSection.classList.add("project-detail-features");
        
        const featuresTitle = document.createElement("h2");
        featuresTitle.textContent = "Funcionalidades";
        featuresSection.appendChild(featuresTitle);
        
        const featuresList = document.createElement("ul");
        project.features.forEach(feature => {
            const featureItem = document.createElement("li");
            featureItem.textContent = feature;
            featuresList.appendChild(featureItem);
        });
        featuresSection.appendChild(featuresList);
        
        infoSection.appendChild(featuresSection);
    }
    
    // Link do projeto (se disponível)
    if (project.link) {
        const linkSection = document.createElement("div");
        linkSection.classList.add("project-detail-link");
        
        const linkButton = document.createElement("a");
        linkButton.href = project.link;
        linkButton.textContent = "Ver projeto ao vivo";
        linkButton.target = "_blank";
        linkButton.classList.add("project-detail-link-button");
        
        linkSection.appendChild(linkButton);
        infoSection.appendChild(linkSection);
    }
    
    detailContainer.appendChild(infoSection);
    contentDiv.appendChild(detailContainer);

    // Posicionamento inicial centralizado
    const header_nav = document.getElementById('header');
    const headerHeight = header_nav ? header_nav.offsetHeight : 0;
    const baseX = window.innerWidth / 2 - detailContainer.offsetWidth / 2;
    const baseY = headerHeight + 5; // Logo abaixo do header

    detailContainer.style.position = "absolute";
    detailContainer.style.left = baseX + "px";
    detailContainer.style.top = baseY + "px";
    detailContainer.dataset.baseX = baseX;
    detailContainer.dataset.baseY = baseY;

    return {
        cleanup: () => detailContainer.remove(),
        elements: { detailContainer }
    };
}

// Função para obter os dados de um projeto específico pelo ID
function getProjectById(projectId) {
    // Lista de projetos com dados completos
    const projects = [
        {
            id: "site-pessoal",
            title: "Site Pessoal",
            description: "Meu site pessoal desenvolvido com JavaScript puro, HTML e CSS.",
            fullDescription: "Este é meu site pessoal que desenvolvi usando JavaScript puro, HTML e CSS. O site apresenta minhas habilidades, projetos e informações de contato. Foi construído com uma arquitetura modular que permite fácil manutenção e expansão.",
            imageUrl: null,
            images: [
                "/images/projects/site-pessoal-1.jpg",
                "/images/projects/site-pessoal-2.jpg",
                "/images/projects/site-pessoal-3.jpg"
            ],
            link: "/",
            progress: 100,
            technologies: ["JavaScript", "HTML5", "CSS3", "Vite"],
            features: [
                "Design responsivo",
                "Navegação SPA (Single Page Application)",
                "Animações suaves",
                "Modo escuro/claro",
                "Portfólio de projetos"
            ]
        },
        {
            id: "impressao-3d",
            title: "Projeto de Impressão 3D",
            description: "Sistema de gerenciamento para impressoras 3D com monitoramento remoto.",
            fullDescription: "Este projeto é um sistema completo de gerenciamento para impressoras 3D que permite monitoramento remoto em tempo real. Ele inclui uma interface web para controle das impressoras, visualização de status e gerenciamento de filas de impressão. O sistema também oferece notificações por email quando uma impressão é concluída ou quando ocorre algum erro.",
            imageUrl: null,
            images: [
                "/images/projects/impressao-3d-1.jpg",
                "/images/projects/impressao-3d-2.jpg"
            ],
            link: null,
            progress: 70,
            technologies: ["JavaScript", "Node.js", "WebSockets", "Express", "MongoDB"],
            features: [
                "Monitoramento em tempo real",
                "Controle remoto de impressoras 3D",
                "Gerenciamento de filas de impressão",
                "Notificações por email",
                "Estatísticas de uso e desempenho"
            ]
        },
        {
            id: "app-notas",
            title: "Aplicativo de Notas",
            description: "Aplicativo para gerenciamento de notas e tarefas diárias.",
            fullDescription: "Este aplicativo de notas foi desenvolvido para ajudar na organização de tarefas diárias e anotações importantes. Ele permite criar, editar e excluir notas, além de organizá-las em categorias e adicionar etiquetas para facilitar a busca. O aplicativo também oferece sincronização entre dispositivos e backup automático na nuvem.",
            imageUrl: null,
            images: [
                "/images/projects/app-notas-1.jpg",
                "/images/projects/app-notas-2.jpg",
                "/images/projects/app-notas-3.jpg",
                "/images/projects/app-notas-4.jpg"
            ],
            link: null,
            progress: 30,
            technologies: ["React", "Redux", "Firebase", "Material-UI"],
            features: [
                "Criação e edição de notas",
                "Organização por categorias",
                "Sistema de etiquetas",
                "Sincronização entre dispositivos",
                "Backup automático",
                "Modo offline"
            ]
        }
    ];

    return projects.find(project => project.id === projectId);
}
