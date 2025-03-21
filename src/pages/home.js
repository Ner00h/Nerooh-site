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
    p.textContent = "Bem vindo ao meu canto na internet, aqui você pode acompanhar meus projetos, interagir com eles, contribuir, adquirir dos nossos produtos ou mesmo transformar a sua imaginação em objetos tangíveis.";
    introText.appendChild(h1);
    introText.appendChild(p);
    homeContainer.appendChild(introText);
    
    // Posicionamento inicial do texto
    function positionIntroText() {
        const baseX = window.innerWidth / 2 - introText.offsetWidth / 2;
        const baseY = window.innerHeight / 2 - introText.offsetHeight / 2 - 100;
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
        const videoBaseY = window.innerHeight / 2 + 180;
        introVideo.style.position = "absolute";
        introVideo.style.left = videoBaseX + "px";
        introVideo.style.top = videoBaseY + "px";
        introVideo.dataset.baseX = videoBaseX;
        introVideo.dataset.baseY = videoBaseY;
    }
    
    positionIntroVideo();
    
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
        elements: { introText, introVideo }
    };
}