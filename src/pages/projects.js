export function renderProjectsPage(contentDiv) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    const projectsContainer = document.createElement("div");
    projectsContainer.classList.add("projects-container");
    
    // Reduzindo ainda mais o padding e a margem para ficar no limite do header
    projectsContainer.style.paddingTop = "5px";
    projectsContainer.style.marginTop = "5px";

    // Título da página
    const title = document.createElement("h1");
    title.textContent = "Meus Projetos";
    title.classList.add("projects-title");
    projectsContainer.appendChild(title);

    // Descrição
    const description = document.createElement("p");
    description.textContent = "Aqui estão alguns dos projetos em que tenho trabalhado recentemente.";
    description.classList.add("projects-description");
    projectsContainer.appendChild(description);

    // Lista de projetos
    const projectsList = document.createElement("div");
    projectsList.classList.add("projects-list");

    // Função para criar um card de projeto
    function createProjectCard(title, description, imageUrl, link) {
        const card = document.createElement("div");
        card.classList.add("project-card");

        const projectImage = document.createElement("div");
        projectImage.classList.add("project-image");
        if (imageUrl) {
            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = title;
            projectImage.appendChild(img);
        } else {
            projectImage.textContent = "🖼️";
        }
        card.appendChild(projectImage);

        const projectInfo = document.createElement("div");
        projectInfo.classList.add("project-info");

        const projectTitle = document.createElement("h3");
        projectTitle.textContent = title;
        projectInfo.appendChild(projectTitle);

        const projectDesc = document.createElement("p");
        projectDesc.textContent = description;
        projectInfo.appendChild(projectDesc);

        if (link) {
            const projectLink = document.createElement("a");
            projectLink.href = link;
            projectLink.textContent = "Ver projeto";
            projectLink.target = "_blank";
            projectInfo.appendChild(projectLink);
        }

        card.appendChild(projectInfo);
        return card;
    }

    // Adicionar alguns projetos de exemplo
    const projects = [
        {
            title: "Site Pessoal",
            description: "Meu site pessoal desenvolvido com JavaScript puro, HTML e CSS.",
            imageUrl: null,
            link: "/"
        },
        {
            title: "Projeto de Impressão 3D",
            description: "Sistema de gerenciamento para impressoras 3D com monitoramento remoto.",
            imageUrl: null,
            link: null
        },
        {
            title: "Aplicativo de Notas",
            description: "Aplicativo para gerenciamento de notas e tarefas diárias.",
            imageUrl: null,
            link: null
        }
    ];

    // Adicionar os projetos à lista
    projects.forEach(project => {
        const card = createProjectCard(
            project.title,
            project.description,
            project.imageUrl,
            project.link
        );
        projectsList.appendChild(card);
    });

    projectsContainer.appendChild(projectsList);
    contentDiv.appendChild(projectsContainer);

    // Posicionamento
    const baseX = window.innerWidth / 2 - projectsContainer.offsetWidth / 2;
    
    // Obtendo a altura do header para um posicionamento mais preciso
    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight : 0;
    
    // Calculando a posição vertical para ficar exatamente abaixo do header
    const baseY = headerHeight + 5; // Apenas 5px de margem para ficar bem no limite
    
    projectsContainer.style.left = baseX + "px";
    projectsContainer.style.top = baseY + "px";
    projectsContainer.dataset.baseX = baseX;
    projectsContainer.dataset.baseY = baseY;

    return {
        cleanup: () => projectsContainer.remove(),
        elements: { projectsContainer }
    };
} 