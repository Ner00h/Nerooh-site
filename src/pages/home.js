export function renderHomePage(contentDiv) {
    contentDiv.innerHTML = ''; // Limpa o conteúdo anterior

    const introText = document.createElement("div");
    introText.classList.add("intro-text");
    const h1 = document.createElement("h1");
    h1.textContent = "Bem-vindos ao meu canto na internet";
    const p = document.createElement("p");
    p.textContent = "Ainda estou em construção ativa e trazendo novidades breves.";
    introText.appendChild(h1);
    introText.appendChild(p);
    contentDiv.appendChild(introText);
    const baseX = window.innerWidth / 2 - introText.offsetWidth / 2;
    const baseY = window.innerHeight / 2 - introText.offsetHeight / 2;
    introText.style.left = baseX + "px";
    introText.style.top = baseY + "px";
    introText.dataset.baseX = baseX;
    introText.dataset.baseY = baseY;

    const introVideo = document.createElement("iframe");
    introVideo.classList.add("intro-video");
    introVideo.src = "https://www.youtube.com/embed/39Y0jPHpYd4?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playlist=39Y0jPHpYd4&start=0";
    introVideo.frameBorder = "0";
    introVideo.allow = "autoplay; encrypted-media";
    introVideo.allowFullscreen = true;
    document.body.appendChild(introVideo);
    const videoBaseX = window.innerWidth / 2 - (window.innerWidth * 0.9) / 2;
    const videoBaseY = window.innerHeight / 2 + 250;
    introVideo.style.left = videoBaseX + "px";
    introVideo.style.top = videoBaseY + "px";
    introVideo.dataset.baseX = videoBaseX;
    introVideo.dataset.baseY = videoBaseY;

    return {
        cleanup: () => {
            introText.remove();
            introVideo.remove();
        },
        elements: { introText, introVideo }
    };
}