export function renderProjectsPage(contentDiv) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    const projectsContainer = document.createElement("div");
    projectsContainer.classList.add("projects-container");
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

    // Função para criar um card de projeto horizontal
    function createProjectCard(title, description, imageUrl, link, progress = 0) {
        const card = document.createElement("div");
        card.classList.add("project-card");

        // Container da imagem
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

        // Container das informações
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

        // Barra de progresso no canto superior direito
        const progressBarContainer = document.createElement("div");
        progressBarContainer.classList.add("progress-bar-container");

        const progressBar = document.createElement("div");
        progressBar.classList.add("progress-bar");
        progressBar.style.width = `${progress}%`; // Progresso inicial (0-100)
        progressBarContainer.appendChild(progressBar);

        card.appendChild(progressBarContainer);

        projectsList.appendChild(card);
    }

    // Adicionar projetos
    const projects = [
        {
            title: "Site Pessoal",
            description: "Meu site pessoal desenvolvido com JavaScript puro, HTML e CSS.",
            imageUrl: null,
            link: "/",
            progress: 100 // Exemplo: 100% concluído
        },
        {
            title: "Projeto de Impressão 3D",
            description: "Sistema de gerenciamento para impressoras 3D com monitoramento remoto.",
            imageUrl: null,
            link: null,
            progress: 70 // Exemplo: 70% concluído
        },
        {
            title: "Aplicativo de Notas",
            description: "Aplicativo para gerenciamento de notas e tarefas diárias.",
            imageUrl: null,
            link: null,
            progress: 30 // Exemplo: 30% concluído
        }
    ];

    projects.forEach(project => {
        createProjectCard(
            project.title,
            project.description,
            project.imageUrl,
            project.link,
            project.progress
        );
    });

    projectsContainer.appendChild(projectsList);
    contentDiv.appendChild(projectsContainer);

    // Posicionamento inicial centralizado como em contact.js
    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight : 0;
    const baseX = window.innerWidth / 2 - projectsContainer.offsetWidth / 2;
    const baseY = headerHeight + 5; // Logo abaixo do header

    projectsContainer.style.position = "absolute";
    projectsContainer.style.left = baseX + "px";
    projectsContainer.style.top = baseY + "px";
    projectsContainer.dataset.baseX = baseX;
    projectsContainer.dataset.baseY = baseY;

    return {
        cleanup: () => projectsContainer.remove(),
        elements: { projectsContainer }
    };
}