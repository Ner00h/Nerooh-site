import { getDatabase, ref, onValue } from 'firebase/database';
import DOMPurify from 'dompurify';

export function renderProjectDetailPage(contentDiv, projectId) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    // Container principal
    const projectDetailContainer = document.createElement("div");
    projectDetailContainer.classList.add("project-detail-container");
    contentDiv.appendChild(projectDetailContainer);

    // Carregar dados do projeto do Firebase
    const db = getDatabase();
    const projectRef = ref(db, `projects/${projectId}`);
    const subpageRef = ref(db, `subpages/${projectId}`);

    onValue(projectRef, (projectSnapshot) => {
        const project = projectSnapshot.val();
        if (!project) {
            // Se o projeto não for encontrado, exibir mensagem de erro
            projectDetailContainer.innerHTML = `
                <h1>Projeto não encontrado</h1>
                <p>O projeto que você está procurando não existe.</p>
                <button id="back-to-projects" class="back-button">Voltar para Projetos</button>
            `;
            
            // Adicionar evento ao botão de voltar
            document.getElementById("back-to-projects").addEventListener("click", () => {
                history.pushState({ page: 'projects' }, null, '/projetos');
                window.dispatchEvent(new Event('route-change'));
            });
            
            return;
        }

        // Carregar subpágina, se existir
        onValue(subpageRef, (subpageSnapshot) => {
            const subpage = subpageSnapshot.val() || {};
            
            // Construir a interface do projeto
            projectDetailContainer.innerHTML = `
                <button class="back-button">← Voltar para Projetos</button>
                <div class="project-detail-header">
                    <h1 class="project-detail-title">${project.title}</h1>
                    <div class="project-detail-progress-container">
                        <span>Progresso: ${project.progress || 0}%</span>
                        <div class="project-detail-progress-bar" style="width: ${project.progress || 0}%"></div>
                    </div>
                </div>
            `;

            // Adicionar imagem se existir
            if (project.imageUrl) {
                const singleImage = document.createElement("div");
                singleImage.classList.add("project-detail-single-image");
                
                const img = document.createElement("img");
                img.src = project.imageUrl;
                img.alt = project.title;
                singleImage.appendChild(img);
                
                projectDetailContainer.appendChild(singleImage);
            }

            // Informações detalhadas
            const infoSection = document.createElement("div");
            infoSection.classList.add("project-detail-info");
            
            // Descrição
            const description = document.createElement("div");
            description.classList.add("project-detail-description");
            
            const descTitle = document.createElement("h2");
            descTitle.textContent = "Descrição";
            description.appendChild(descTitle);
            
            const descText = document.createElement("p");
            descText.textContent = project.description;
            description.appendChild(descText);
            
            infoSection.appendChild(description);

            // Conteúdo da subpágina
            const contentSection = document.createElement("div");
            contentSection.classList.add("project-detail-content");
            
            const contentTitle = document.createElement("h2");
            contentTitle.textContent = "Conteúdo";
            contentSection.appendChild(contentTitle);
            
            const contentDiv = document.createElement("div");
            contentDiv.classList.add("project-detail-content-html");
            
            // Sanitizar o HTML antes de injetá-lo no DOM
            const sanitizedContent = subpage.content 
                ? DOMPurify.sanitize(subpage.content) 
                : 'Nenhum conteúdo adicional disponível.';
                
            contentDiv.innerHTML = sanitizedContent;
            contentSection.appendChild(contentDiv);
            
            infoSection.appendChild(contentSection);
            
            projectDetailContainer.appendChild(infoSection);

            // Evento do botão voltar
            projectDetailContainer.querySelector('.back-button').addEventListener('click', () => {
                history.pushState({ page: 'projects' }, null, '/projetos');
                window.dispatchEvent(new Event('route-change'));
            });

            // Posicionamento dinâmico
            const baseX = window.innerWidth / 2 - projectDetailContainer.offsetWidth / 2;
            const headerHeight = document.getElementById('header').offsetHeight;
            const baseY = headerHeight + 20;
            projectDetailContainer.style.position = "absolute";
            projectDetailContainer.style.left = baseX + 'px';
            projectDetailContainer.style.top = baseY + 'px';
            projectDetailContainer.dataset.baseX = baseX;
            projectDetailContainer.dataset.baseY = baseY;
        });
    });

    return {
        cleanup: () => projectDetailContainer.remove(),
        elements: { projectDetailContainer }
    };
}
