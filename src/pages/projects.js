import { getDatabase, ref, onValue } from 'firebase/database';

export function renderProjectsPage(contentDiv) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    const projectsContainer = document.createElement("div");
    projectsContainer.classList.add("projects-container");
    projectsContainer.style.paddingTop = "5px";
    projectsContainer.style.marginTop = "5px";
    contentDiv.appendChild(projectsContainer);

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
    projectsContainer.appendChild(projectsList);

    // Carregar projetos do Firebase
    const db = getDatabase();
    const projectsRef = ref(db, 'projects');
    
    onValue(projectsRef, (snapshot) => {
        projectsList.innerHTML = ''; // Limpar lista antes de recarregar
        const projects = snapshot.val() || {};
        
        if (Object.keys(projects).length === 0) {
            const noProjectsMessage = document.createElement("p");
            noProjectsMessage.textContent = "Nenhum projeto encontrado.";
            noProjectsMessage.classList.add("no-projects-message");
            projectsList.appendChild(noProjectsMessage);
        } else {
            Object.entries(projects).forEach(([id, project]) => {
                createProjectCard(id, project);
            });
        }
        
        // Posicionamento inicial centralizado
        const header = document.getElementById('header');
        const headerHeight = header ? header.offsetHeight : 0;
        const baseX = window.innerWidth / 2 - projectsContainer.offsetWidth / 2;
        const baseY = headerHeight + 5; // Logo abaixo do header

        projectsContainer.style.position = "absolute";
        projectsContainer.style.left = baseX + "px";
        projectsContainer.style.top = baseY + "px";
        projectsContainer.dataset.baseX = baseX;
        projectsContainer.dataset.baseY = baseY;
    });

    // Função para criar um card de projeto horizontal
    function createProjectCard(id, project) {
        const card = document.createElement("div");
        card.classList.add("project-card");
        // Adicionar cursor pointer para indicar que é clicável
        card.style.cursor = "pointer";
        
        // Adicionar evento de clique para navegar para a página de detalhes
        card.addEventListener("click", () => {
            history.pushState({ page: 'project-detail', projectId: id }, null, `/projetos/${id}`);
            window.dispatchEvent(new Event('route-change'));
        });

        // Container da imagem
        const projectImage = document.createElement("div");
        projectImage.classList.add("project-image");
        if (project.imageUrl) {
            const img = document.createElement("img");
            img.src = project.imageUrl;
            img.alt = project.title;
            projectImage.appendChild(img);
        } else {
            projectImage.textContent = "🖼️";
        }
        card.appendChild(projectImage);

        // Container das informações
        const projectInfo = document.createElement("div");
        projectInfo.classList.add("project-info");

        const projectTitle = document.createElement("h3");
        projectTitle.textContent = project.title;
        projectInfo.appendChild(projectTitle);

        const projectDesc = document.createElement("p");
        projectDesc.textContent = project.description;
        projectInfo.appendChild(projectDesc);

        // Substituir o link direto por um botão "Ver mais"
        const viewMoreBtn = document.createElement("button");
        viewMoreBtn.textContent = "Ver mais";
        viewMoreBtn.classList.add("view-more-btn");
        projectInfo.appendChild(viewMoreBtn);

        card.appendChild(projectInfo);

        // Barra de progresso no canto superior direito
        const progressBarContainer = document.createElement("div");
        progressBarContainer.classList.add("progress-bar-container");

        const progressBar = document.createElement("div");
        progressBar.classList.add("progress-bar");
        progressBar.style.width = `${project.progress || 0}%`; // Progresso inicial (0-100)
        progressBarContainer.appendChild(progressBar);

        card.appendChild(progressBarContainer);

        projectsList.appendChild(card);
    }

    return {
        cleanup: () => projectsContainer.remove(),
        elements: { projectsContainer }
    };
}