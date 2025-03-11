export function renderContactPage(contentDiv) {
    const contactInfo = document.createElement("div");
    contactInfo.classList.add("contact-info");
    
    // Reduzindo ainda mais o padding e a margem para ficar no limite do header
    contactInfo.style.paddingTop = "5px";
    contactInfo.style.marginTop = "5px";

    const creator = document.createElement("div");
    creator.classList.add("contact-item");
    creator.textContent = "👤 Criador: Carlito Batista (Nerooh)";
    contactInfo.appendChild(creator);

    const instagram = document.createElement("div");
    instagram.classList.add("contact-item");
    const igLink1 = document.createElement("a");
    igLink1.href = "https://instagram.com/nero.std";
    igLink1.textContent = "@Nero.std";
    const igLink2 = document.createElement("a");
    igLink2.href = "https://instagram.com/nero.desisto";
    igLink2.textContent = "@nero.desisto";
    instagram.innerHTML = "📸 Instagram: ";
    instagram.appendChild(igLink1);
    instagram.appendChild(document.createTextNode(" / "));
    instagram.appendChild(igLink2);
    contactInfo.appendChild(instagram);

    const email = document.createElement("div");
    email.classList.add("contact-item");
    const emailLink = document.createElement("a");
    emailLink.href = "mailto:contato@nerooh.xyz";
    emailLink.textContent = "contato@nerooh.xyz";
    email.innerHTML = "📧 Email: ";
    email.appendChild(emailLink);
    contactInfo.appendChild(email);

    const donation = document.createElement("div");
    donation.classList.add("contact-item");
    const donationSpan = document.createElement("span");
    const donationMessage = document.createElement("div");
    donationMessage.classList.add("donation-message");
    donationMessage.textContent = "Gostou do meu trabalho? Apoie meus projetos com uma doação via PIX!";
    const pix = document.createTextNode("PIX: pix@nerooh.xyz");
    const qrMessage = document.createElement("div");
    qrMessage.classList.add("qr-message");
    qrMessage.textContent = "Ou aponte a câmera do celular para o QR Code abaixo:";
    const qrCode = document.createElement("div");
    qrCode.classList.add("qr-code");
    const qrImg = document.createElement("img");
    qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=00020126360014br.gov.bcb.pix0114pix@nerooh.xyz5204000053039865802BR5925Carlito Batista Do Nascim6009Sao Paulo62290525REC67BBEFC5523B146905260163047D36";
    qrImg.alt = "QR Code PIX";
    qrCode.appendChild(qrImg);
    donationSpan.appendChild(donationMessage);
    donationSpan.appendChild(document.createElement("br"));
    donationSpan.appendChild(pix);
    donationSpan.appendChild(document.createElement("br"));
    donationSpan.appendChild(qrMessage);
    donationSpan.appendChild(qrCode);
    donation.innerHTML = "💰 ";
    donation.appendChild(donationSpan);
    contactInfo.appendChild(donation);

    contentDiv.appendChild(contactInfo);

    const baseX = window.innerWidth / 2 - contactInfo.offsetWidth / 2;
    
    // Obtendo a altura do header para um posicionamento mais preciso
    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight : 0;
    
    // Calculando a posição vertical para ficar exatamente abaixo do header
    const baseY = headerHeight + 5; // Apenas 5px de margem para ficar bem no limite
    
    contactInfo.style.left = baseX + "px";
    contactInfo.style.top = baseY + "px";
    contactInfo.dataset.baseX = baseX;
    contactInfo.dataset.baseY = baseY;

    return {
        cleanup: () => contactInfo.remove(),
        elements: { contactInfo }
    };
}