import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyCKKWqZvVKi0GZDL1Ox9NC2y-zlkPqqhp8",
    authDomain: "nerooh-site.firebaseapp.com",
    projectId: "nerooh-site",
    storageBucket: "nerooh-site.firebasestorage.app",
    messagingSenderId: "953464728137",
    appId: "1:953464728137:web:89dac94581e4f03cf86d98",
    measurementId: "G-MRFQRTQY9R",
    databaseURL: "https://nerooh-site-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let currentUser = null;

export function setupAuth(updateAuthStatus) {
    console.log('Configurando autenticação');
    
    // Criar container para o perfil do usuário
    const userProfileContainer = document.createElement("div");
    userProfileContainer.id = "user-profile-container";
    userProfileContainer.classList.add("user-profile-container");
    
    // Botão de login (visível quando não logado)
    const authButton = document.createElement("button");
    authButton.id = "auth-button";
    authButton.classList.add("nav-item");
    authButton.textContent = 'Login';
    userProfileContainer.appendChild(authButton);
    
    // Container para o avatar e dropdown (visível quando logado)
    const userAvatarContainer = document.createElement("div");
    userAvatarContainer.id = "user-avatar-container";
    userAvatarContainer.classList.add("user-avatar-container");
    userAvatarContainer.style.display = "none";
    
    // Avatar do usuário
    const userAvatar = document.createElement("img");
    userAvatar.id = "user-avatar";
    userAvatar.classList.add("user-avatar");
    userAvatar.alt = "Perfil";
    userAvatarContainer.appendChild(userAvatar);
    
    // Menu dropdown
    const dropdownMenu = document.createElement("div");
    dropdownMenu.id = "dropdown-menu";
    dropdownMenu.classList.add("dropdown-menu");
    
    // Nome do usuário no dropdown
    const userName = document.createElement("div");
    userName.id = "user-name";
    userName.classList.add("user-name");
    dropdownMenu.appendChild(userName);
    
    // Email do usuário no dropdown
    const userEmail = document.createElement("div");
    userEmail.id = "user-email";
    userEmail.classList.add("user-email");
    dropdownMenu.appendChild(userEmail);
    
    // Separador
    const separator = document.createElement("div");
    separator.classList.add("dropdown-separator");
    dropdownMenu.appendChild(separator);
    
    // Botão de admin (será mostrado apenas para administradores)
    const adminButton = document.createElement("button");
    adminButton.id = "admin-button";
    adminButton.classList.add("dropdown-item");
    adminButton.textContent = "Admin";
    adminButton.style.display = "none"; // Inicialmente oculto, será mostrado apenas para admins
    dropdownMenu.appendChild(adminButton);
    
    // Botão de editar perfil
    const editProfileButton = document.createElement("button");
    editProfileButton.id = "edit-profile-button";
    editProfileButton.classList.add("dropdown-item");
    editProfileButton.textContent = "Editar Perfil";
    dropdownMenu.appendChild(editProfileButton);
    
    // Botão de Minhas Compras
    const myOrdersButton = document.createElement("button");
    myOrdersButton.id = "my-orders-button";
    myOrdersButton.classList.add("dropdown-item");
    myOrdersButton.textContent = "Minhas Compras";
    myOrdersButton.onclick = () => {
        // Fechar dropdown
        dropdownMenu.classList.remove("show");
        // Navegar para a página de pedidos
        history.pushState({ page: 'my-orders' }, null, '/my-orders');
        window.dispatchEvent(new CustomEvent('route-change'));
    };
    dropdownMenu.appendChild(myOrdersButton);
    
    // Separador adicional
    const separator2 = document.createElement("div");
    separator2.classList.add("dropdown-separator");
    dropdownMenu.appendChild(separator2);
    
    // Botão de logout
    const logoutButton = document.createElement("button");
    logoutButton.id = "logout-button";
    logoutButton.classList.add("dropdown-item");
    logoutButton.textContent = "Sair";
    dropdownMenu.appendChild(logoutButton);
    
    userAvatarContainer.appendChild(dropdownMenu);
    userProfileContainer.appendChild(userAvatarContainer);
    
    // Verificar se o elemento .nav-menu existe antes de adicionar
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.appendChild(userProfileContainer);
    } else {
        console.error('Elemento .nav-menu não encontrado');
        // Tentar adicionar ao header como fallback
        setTimeout(() => {
            const navMenuRetry = document.querySelector('.nav-menu');
            if (navMenuRetry) {
                navMenuRetry.appendChild(userProfileContainer);
                console.log('Elemento adicionado ao .nav-menu após retry');
            } else {
                const header = document.querySelector('header');
                if (header) {
                    header.appendChild(userProfileContainer);
                    console.log('Elemento adicionado ao header como fallback');
                } else {
                    console.error('Não foi possível encontrar um elemento para adicionar o userProfileContainer');
                }
            }
        }, 500);
    }

    // Função para atualizar a interface com base no estado de autenticação
    function updateButton(user) {
        console.log('Atualizando botão de autenticação:', user ? 'Usuário autenticado' : 'Usuário não autenticado');
        
        // Verificar se os elementos existem antes de manipulá-los
        const authButtonCheck = document.getElementById('auth-button');
        const userAvatarContainerCheck = document.getElementById('user-avatar-container');
        
        if (!authButtonCheck || !userAvatarContainerCheck) {
            console.error('Elementos de autenticação não encontrados no DOM');
            return;
        }
        
        if (user) {
            currentUser = user;
            
            // Esconder botão de login e mostrar avatar
            authButtonCheck.style.display = "none";
            userAvatarContainerCheck.style.display = "block";
            
            // Atualizar avatar
            const userAvatarCheck = document.getElementById('user-avatar');
            if (userAvatarCheck) {
                const photoURL = user.photoURL || '/default-avatar.svg';
                userAvatarCheck.src = photoURL;
            }
            
            // Atualizar informações do usuário no dropdown
            const userNameCheck = document.getElementById('user-name');
            const userEmailCheck = document.getElementById('user-email');
            
            if (userNameCheck) {
                userNameCheck.textContent = user.displayName || 'Usuário';
            }
            
            if (userEmailCheck) {
                userEmailCheck.textContent = user.email || '';
            }
            
            // Configurar evento de editar perfil
            const editProfileButtonCheck = document.getElementById('edit-profile-button');
            if (editProfileButtonCheck) {
                editProfileButtonCheck.onclick = () => {
                    // Fechar dropdown
                    const dropdownMenuCheck = document.getElementById('dropdown-menu');
                    if (dropdownMenuCheck) {
                        dropdownMenuCheck.classList.remove("show");
                    }
                    
                    // Abrir modal de edição de perfil
                    showEditProfileModal(user);
                };
            }
            
            // Verificar se o usuário é administrador e mostrar o botão de admin
            const adminButtonCheck = document.getElementById('admin-button');
            if (adminButtonCheck) {
                if (isAdmin()) {
                    adminButtonCheck.style.display = "flex";
                    adminButtonCheck.onclick = () => {
                        // Fechar dropdown
                        const dropdownMenuCheck = document.getElementById('dropdown-menu');
                        if (dropdownMenuCheck) {
                            dropdownMenuCheck.classList.remove("show");
                        }
                        
                        // Navegar para a página de admin
                        history.pushState({ page: 'admin' }, null, '/admin');
                        window.dispatchEvent(new CustomEvent('route-change'));
                    };
                } else {
                    adminButtonCheck.style.display = "none";
                }
            }
            
            // Configurar evento de logout
            const logoutButtonCheck = document.getElementById('logout-button');
            if (logoutButtonCheck) {
                logoutButtonCheck.onclick = () => {
                    signOut(auth)
                        .then(() => {
                            console.log("Usuário deslogado");
                            // Fechar dropdown se estiver aberto
                            const dropdownMenuCheck = document.getElementById('dropdown-menu');
                            if (dropdownMenuCheck) {
                                dropdownMenuCheck.classList.remove("show");
                            }
                            // Usar history.pushState em vez de window.location para evitar recarregar a página
                            history.pushState({ page: 'home' }, null, '/');
                            // Disparar um evento personalizado para notificar o router sobre a mudança
                            window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { authenticated: false } }));
                        })
                        .catch((error) => console.error("Erro ao deslogar:", error.message));
                };
            }
            
            // Disparar evento para notificar que o usuário está autenticado
            window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { authenticated: true } }));
        } else {
            currentUser = null;
            
            // Mostrar botão de login e esconder avatar
            authButtonCheck.style.display = "block";
            userAvatarContainerCheck.style.display = "none";
            
            // Limpar avatar e informações do usuário
            const userAvatarCheck = document.getElementById('user-avatar');
            const userNameCheck = document.getElementById('user-name');
            const userEmailCheck = document.getElementById('user-email');
            
            if (userAvatarCheck) {
                userAvatarCheck.src = '';
            }
            
            if (userNameCheck) {
                userNameCheck.textContent = '';
            }
            
            if (userEmailCheck) {
                userEmailCheck.textContent = '';
            }
            
            // O evento de clique do botão de login é gerenciado no router.js
            authButtonCheck.onclick = () => {
                history.pushState({ page: 'login' }, null, '/login');
                window.dispatchEvent(new CustomEvent('route-change'));
            };
            
            // Disparar evento para notificar que o usuário não está autenticado
            window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { authenticated: false } }));
        }
        updateAuthStatus(!!user);
    }

    // Configurar toggle do dropdown ao clicar no avatar
    userAvatar.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle("show");
    });
    
    // Fechar dropdown ao clicar fora dele
    document.addEventListener('click', () => {
        dropdownMenu.classList.remove("show");
    });

    // Verificar o estado de autenticação atual imediatamente
    const currentAuthUser = auth.currentUser;
    if (currentAuthUser) {
        console.log('Usuário já está autenticado:', currentAuthUser.displayName || currentAuthUser.email);
        // Atualizar a interface imediatamente
        setTimeout(() => updateButton(currentAuthUser), 100);
    }

    // Adicionar listener para mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('Estado de autenticação alterado:', user ? 'Usuário autenticado' : 'Usuário não autenticado');
        updateButton(user);
    });

    // Adicionar listener para o evento de mudança de rota para atualizar o botão
    window.addEventListener('route-change', () => {
        console.log('Rota alterada, verificando autenticação');
        const user = auth.currentUser;
        if (user) {
            updateButton(user);
        }
    });

    // Verificar periodicamente se o botão está correto (como fallback)
    const checkInterval = setInterval(() => {
        const user = auth.currentUser;
        const authButtonCheck = document.getElementById('auth-button');
        const userAvatarContainerCheck = document.getElementById('user-avatar-container');
        
        if (user && authButtonCheck && userAvatarContainerCheck) {
            if (authButtonCheck.style.display !== "none" || userAvatarContainerCheck.style.display !== "block") {
                console.log('Corrigindo estado do botão de autenticação');
                updateButton(user);
            }
        }
    }, 2000);

    return () => {
        unsubscribe();
        clearInterval(checkInterval);
        if (userProfileContainer.parentNode) {
            userProfileContainer.remove();
        }
        
        // Remover modal de edição de perfil se existir
        const existingModal = document.getElementById('edit-profile-modal');
        if (existingModal) {
            existingModal.remove();
        }
    };
}

// Função para mostrar o modal de edição de perfil
function showEditProfileModal(user) {
    console.log('Abrindo modal de edição de perfil para:', user.email);
    
    // Remover modal existente se houver
    const existingModal = document.getElementById('edit-profile-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Criar o modal
    const modal = document.createElement("div");
    modal.id = "edit-profile-modal";
    modal.classList.add("edit-profile-modal");
    
    // Container do modal
    const modalContent = document.createElement("div");
    modalContent.classList.add("edit-profile-modal-content");
    
    // Cabeçalho do modal
    const modalHeader = document.createElement("div");
    modalHeader.classList.add("edit-profile-modal-header");
    
    const modalTitle = document.createElement("h3");
    modalTitle.textContent = "Editar Perfil";
    modalHeader.appendChild(modalTitle);
    
    const closeButton = document.createElement("button");
    closeButton.classList.add("close-modal-button");
    closeButton.innerHTML = "&times;";
    closeButton.onclick = () => modal.remove();
    modalHeader.appendChild(closeButton);
    
    modalContent.appendChild(modalHeader);
    
    // Corpo do modal
    const modalBody = document.createElement("div");
    modalBody.classList.add("edit-profile-modal-body");
    
    // Formulário de edição
    const editForm = document.createElement("form");
    editForm.classList.add("edit-profile-form");
    
    // Campo de nome de usuário
    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Nome de Usuário:";
    nameLabel.htmlFor = "display-name-input";
    editForm.appendChild(nameLabel);
    
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "display-name-input";
    nameInput.classList.add("edit-profile-input");
    nameInput.value = user.displayName || '';
    nameInput.placeholder = "Seu nome de usuário";
    editForm.appendChild(nameInput);
    
    // Seleção de avatar
    const avatarLabel = document.createElement("label");
    avatarLabel.textContent = "Escolha seu Avatar:";
    avatarLabel.classList.add("avatar-selection-label");
    editForm.appendChild(avatarLabel);
    
    const avatarSelection = document.createElement("div");
    avatarSelection.classList.add("avatar-selection");
    
    // Lista de avatares disponíveis
    const avatars = [
        { src: '/default-avatar.svg', alt: 'Avatar Padrão' },
        { src: '/avatars/avatar1.svg', alt: 'Avatar 1' },
        { src: '/avatars/avatar2.svg', alt: 'Avatar 2' },
        { src: '/avatars/avatar3.svg', alt: 'Avatar 3' },
        { src: '/avatars/avatar4.svg', alt: 'Avatar 4' },
        { src: '/avatars/avatar5.svg', alt: 'Avatar 5' },
        { src: '/avatars/avatar6.svg', alt: 'Avatar 6' }
    ];
    
    // Criar elementos para cada avatar
    avatars.forEach((avatar, index) => {
        const avatarOption = document.createElement("div");
        avatarOption.classList.add("avatar-option");
        
        const avatarImg = document.createElement("img");
        avatarImg.src = avatar.src;
        avatarImg.alt = avatar.alt;
        
        // Marcar o avatar atual do usuário como selecionado
        if (user.photoURL === avatar.src || (!user.photoURL && index === 0)) {
            avatarOption.classList.add("selected");
        }
        
        // Adicionar evento de clique para selecionar avatar
        avatarOption.onclick = () => {
            // Remover seleção anterior
            document.querySelectorAll('.avatar-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Adicionar seleção ao avatar clicado
            avatarOption.classList.add('selected');
        };
        
        avatarOption.appendChild(avatarImg);
        avatarSelection.appendChild(avatarOption);
    });
    
    editForm.appendChild(avatarSelection);
    
    // Opção para upload de avatar personalizado
    const customAvatarLabel = document.createElement("label");
    customAvatarLabel.textContent = "Ou faça upload do seu próprio avatar:";
    customAvatarLabel.classList.add("custom-avatar-label");
    editForm.appendChild(customAvatarLabel);
    
    const customAvatarInput = document.createElement("input");
    customAvatarInput.type = "file";
    customAvatarInput.id = "custom-avatar-input";
    customAvatarInput.accept = "image/*";
    customAvatarInput.classList.add("custom-avatar-input");
    editForm.appendChild(customAvatarInput);
    
    // Botões de ação
    const actionButtons = document.createElement("div");
    actionButtons.classList.add("edit-profile-actions");
    
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.classList.add("cancel-button");
    cancelButton.textContent = "Cancelar";
    cancelButton.onclick = () => modal.remove();
    actionButtons.appendChild(cancelButton);
    
    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.classList.add("save-button");
    saveButton.textContent = "Salvar";
    actionButtons.appendChild(saveButton);
    
    editForm.appendChild(actionButtons);
    
    // Adicionar evento de submit ao formulário
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Mostrar indicador de carregamento
        const loadingIndicator = document.createElement("div");
        loadingIndicator.classList.add("loading-indicator");
        loadingIndicator.textContent = "Salvando alterações...";
        modalBody.appendChild(loadingIndicator);
        
        // Desabilitar botões durante o salvamento
        saveButton.disabled = true;
        cancelButton.disabled = true;
        
        // Obter o nome de usuário
        const newDisplayName = nameInput.value.trim();
        
        // Obter o avatar selecionado
        let newPhotoURL = null;
        const selectedAvatar = document.querySelector('.avatar-option.selected img');
        if (selectedAvatar) {
            newPhotoURL = selectedAvatar.src;
        }
        
        // Verificar se há um arquivo de avatar personalizado
        const customAvatarFile = customAvatarInput.files[0];
        
        // Função para atualizar o perfil
        const updateUserProfile = (photoURL) => {
            import('firebase/auth').then(({ updateProfile }) => {
                updateProfile(user, {
                    displayName: newDisplayName,
                    photoURL: photoURL
                }).then(() => {
                    console.log("Perfil atualizado com sucesso");
                    
                    // Atualizar a interface
                    const userAvatarCheck = document.getElementById('user-avatar');
                    const userNameCheck = document.getElementById('user-name');
                    
                    if (userAvatarCheck) {
                        userAvatarCheck.src = photoURL;
                    }
                    
                    if (userNameCheck) {
                        userNameCheck.textContent = newDisplayName;
                    }
                    
                    // Fechar o modal
                    modal.remove();
                    
                    // Mostrar mensagem de sucesso
                    showNotification("Perfil atualizado com sucesso!");
                    
                    // Disparar evento para notificar que o usuário foi atualizado
                    window.dispatchEvent(new CustomEvent('user-updated'));
                }).catch((error) => {
                    console.error("Erro ao atualizar perfil:", error.message);
                    
                    // Remover indicador de carregamento
                    loadingIndicator.remove();
                    
                    // Habilitar botões novamente
                    saveButton.disabled = false;
                    cancelButton.disabled = false;
                    
                    // Mostrar mensagem de erro
                    const errorMessage = document.createElement("div");
                    errorMessage.classList.add("error-message");
                    errorMessage.textContent = "Erro ao atualizar perfil. Tente novamente.";
                    modalBody.appendChild(errorMessage);
                    
                    // Remover mensagem de erro após 3 segundos
                    setTimeout(() => {
                        errorMessage.remove();
                    }, 3000);
                });
            });
        };
        
        // Se houver um arquivo de avatar personalizado, fazer upload
        if (customAvatarFile) {
            // Usar FileReader para converter a imagem em Data URL
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataURL = e.target.result;
                updateUserProfile(dataURL);
            };
            reader.readAsDataURL(customAvatarFile);
        } else {
            // Usar o avatar selecionado da lista
            updateUserProfile(newPhotoURL);
        }
    });
    
    modalBody.appendChild(editForm);
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Função para mostrar notificação
function showNotification(message) {
    // Remover notificação existente se houver
    const existingNotification = document.getElementById('notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Criar notificação
    const notification = document.createElement("div");
    notification.id = "notification";
    notification.classList.add("notification");
    notification.textContent = message;
    
    // Adicionar ao corpo do documento
    document.body.appendChild(notification);
    
    // Mostrar notificação
    setTimeout(() => {
        notification.classList.add("show");
    }, 100);
    
    // Remover notificação após 3 segundos
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

export function getCurrentUser() {
    return currentUser;
}

export function isAdmin() {
    const user = getCurrentUser();
    console.log("Verificando admin:", user ? user.email : "Usuário não logado");
    
    // Lista de emails de administradores
    const adminEmails = [
        'nerooh.extremeh@gmail.com',
        'erikabms1212@gmail.com'
    ];
    
    return user && adminEmails.includes(user.email);
}

export function isAuthenticated() {
    return !!currentUser || !!auth.currentUser;
}