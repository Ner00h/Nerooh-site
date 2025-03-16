import { getDatabase, ref, onValue } from 'firebase/database';
import DOMPurify from 'dompurify';

export function renderProjectDetailPage(contentDiv, projectId) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    // Container principal
    const projectDetailContainer = document.createElement("div");
    projectDetailContainer.classList.add("project-detail-container");
    contentDiv.appendChild(projectDetailContainer);

    // Posicionamento fixo (sem movimento para economizar processamento)
    const baseX = window.innerWidth / 2 - projectDetailContainer.offsetWidth / 2;
    const headerHeight = document.getElementById('header').offsetHeight;
    const baseY = headerHeight + 20;
    projectDetailContainer.style.position = "absolute";
    projectDetailContainer.style.left = baseX + 'px';
    projectDetailContainer.style.top = baseY + 'px';

    // Função para ajustar a posição do container apenas quando necessário (redimensionamento)
    function adjustContainerPosition() {
        const updatedBaseX = window.innerWidth / 2 - projectDetailContainer.offsetWidth / 2;
        projectDetailContainer.style.left = updatedBaseX + 'px';
    }

    // Ajustar posição após um curto período para garantir que o DOM foi renderizado
    setTimeout(adjustContainerPosition, 50);

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
                // Rolar a página para o topo antes de mudar de rota
                window.scrollTo(0, 0);
                
                history.pushState({ page: 'projects' }, null, '/projetos');
                window.dispatchEvent(new Event('route-change'));
            });
            
            // Ajustar posição após carregar o conteúdo de erro
            setTimeout(adjustContainerPosition, 100);
            
            return;
        }

        // Carregar subpágina, se existir
        onValue(subpageRef, (subpageSnapshot) => {
            const subpage = subpageSnapshot.val() || {};
            
            // Construir a interface do projeto - apenas com botão de voltar
            projectDetailContainer.innerHTML = `
                <button class="back-button">← Voltar para Projetos</button>
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

            // Conteúdo da subpágina - sem título
            const contentDiv = document.createElement("div");
            contentDiv.classList.add("project-detail-content-html");
            
            // Sanitizar o HTML antes de injetá-lo no DOM
            const sanitizedContent = subpage.content 
                ? DOMPurify.sanitize(subpage.content) 
                : 'Nenhum conteúdo adicional disponível.';
                
            contentDiv.innerHTML = sanitizedContent;
            
            // Adicionar o conteúdo diretamente ao container principal
            projectDetailContainer.appendChild(contentDiv);

            // Evento do botão voltar
            projectDetailContainer.querySelector('.back-button').addEventListener('click', () => {
                // Rolar a página para o topo antes de mudar de rota
                window.scrollTo(0, 0);
                
                history.pushState({ page: 'projects' }, null, '/projetos');
                window.dispatchEvent(new Event('route-change'));
            });

            // Ajustar posição após o carregamento completo do conteúdo
            setTimeout(adjustContainerPosition, 100);
        });
    });

    // Adicionar evento de redimensionamento da janela
    window.addEventListener('resize', adjustContainerPosition);

    return {
        cleanup: () => {
            projectDetailContainer.remove();
            window.removeEventListener('resize', adjustContainerPosition);
        },
        elements: {} // Retornar um objeto elements vazio para que o container não seja adicionado ao dynamicElements
    };
}
