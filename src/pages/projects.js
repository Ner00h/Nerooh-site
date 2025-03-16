import { getDatabase, ref, onValue } from 'firebase/database';

export function renderProjectsPage(contentDiv) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    const projectsContainer = document.createElement("div");
    projectsContainer.classList.add("projects-container");
    projectsContainer.style.paddingTop = "5px";
    projectsContainer.style.marginTop = "5px";
    projectsContainer.style.maxWidth = "800px"; // Definir largura máxima
    projectsContainer.style.width = "90%"; // Garantir responsividade
    projectsContainer.style.overflowX = "hidden"; // Evitar overflow horizontal
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
    projectsList.style.width = "100%"; // Garantir que a lista ocupe toda a largura disponível
    projectsList.style.display = "flex";
    projectsList.style.flexDirection = "column";
    projectsList.style.gap = "20px";
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
        card.style.cursor = "pointer";
        card.style.display = "flex";
        card.style.flexDirection = "row";
        card.style.alignItems = "center";
        card.style.width = "100%"; // Garantir que o card ocupe toda a largura disponível
        card.style.maxWidth = "100%"; // Limitar a largura máxima
        card.style.boxSizing = "border-box"; // Incluir padding e border na largura total
        card.style.overflow = "hidden"; // Evitar que o conteúdo ultrapasse o card
        
        // Adicionar evento de clique para navegar para a página de detalhes
        card.addEventListener("click", () => {
            // Rolar a página para o topo antes de mudar de rota
            window.scrollTo(0, 0);
            
            history.pushState({ page: 'project-detail', projectId: id }, null, `/projetos/${id}`);
            window.dispatchEvent(new Event('route-change'));
        });

        // Container da imagem
        const projectImage = document.createElement("div");
        projectImage.classList.add("project-image");
        projectImage.style.flexShrink = "0";
        projectImage.style.width = "120px";
        projectImage.style.height = "120px";
        projectImage.style.marginRight = "15px";
        
        if (project.imageUrl) {
            const img = document.createElement("img");
            img.src = project.imageUrl;
            img.alt = project.title;
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "cover";
            projectImage.appendChild(img);
        } else {
            projectImage.textContent = "🖼️";
            projectImage.style.display = "flex";
            projectImage.style.alignItems = "center";
            projectImage.style.justifyContent = "center";
            projectImage.style.fontSize = "2rem";
        }
        card.appendChild(projectImage);

        // Container das informações
        const projectInfo = document.createElement("div");
        projectInfo.classList.add("project-info");
        projectInfo.style.flex = "1";
        projectInfo.style.overflow = "hidden"; // Evitar que o texto ultrapasse o container
        
        const projectTitle = document.createElement("h3");
        projectTitle.textContent = project.title;
        projectTitle.style.margin = "0 0 8px 0";
        projectTitle.style.fontSize = "1.2rem";
        projectInfo.appendChild(projectTitle);

        const projectDesc = document.createElement("p");
        projectDesc.textContent = project.description;
        projectDesc.style.margin = "0 0 12px 0";
        projectDesc.style.fontSize = "0.9rem";
        projectDesc.style.overflow = "hidden";
        projectDesc.style.textOverflow = "ellipsis";
        projectDesc.style.display = "-webkit-box";
        projectDesc.style.webkitLineClamp = "2";
        projectDesc.style.webkitBoxOrient = "vertical";
        projectInfo.appendChild(projectDesc);

        // Botão "Ver mais"
        const viewMoreBtn = document.createElement("button");
        viewMoreBtn.textContent = "Ver mais";
        viewMoreBtn.classList.add("view-more-btn");
        viewMoreBtn.style.padding = "5px 10px";
        viewMoreBtn.style.border = "none";
        viewMoreBtn.style.borderRadius = "4px";
        viewMoreBtn.style.backgroundColor = "#00ffcc";
        viewMoreBtn.style.color = "#000";
        viewMoreBtn.style.cursor = "pointer";
        projectInfo.appendChild(viewMoreBtn);

        card.appendChild(projectInfo);

        // Barra de progresso no canto superior direito
        const progressBarContainer = document.createElement("div");
        progressBarContainer.classList.add("progress-bar-container");
        progressBarContainer.style.position = "absolute";
        progressBarContainer.style.top = "10px";
        progressBarContainer.style.right = "10px";
        progressBarContainer.style.width = "60px";
        progressBarContainer.style.height = "6px";
        progressBarContainer.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        progressBarContainer.style.borderRadius = "3px";

        const progressBar = document.createElement("div");
        progressBar.classList.add("progress-bar");
        progressBar.style.height = "100%";
        progressBar.style.backgroundColor = "#00ffcc";
        progressBar.style.borderRadius = "3px";
        progressBar.style.width = `${project.progress || 0}%`; // Progresso inicial (0-100)
        progressBarContainer.appendChild(progressBar);

        card.appendChild(progressBarContainer);

        projectsList.appendChild(card);
    }

    return {
        cleanup: () => projectsContainer.remove(),
        elements: { projectsContainer } // Restaurar o container para que seja adicionado ao dynamicElements
    };
}