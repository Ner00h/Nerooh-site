import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { renderControlPage } from './control.js';

// Função para renderizar a página de login com FirebaseUI
export function renderLoginPage(contentDiv, message = null) {
    contentDiv.innerHTML = ''; // Limpar conteúdo anterior

    const loginPage = document.createElement("div");
    loginPage.classList.add("login-page");

    const h2 = document.createElement("h2");
    h2.textContent = "Faça Login";
    loginPage.appendChild(h2);

    // Adicionar mensagem personalizada se fornecida
    if (message) {
        const messageElement = document.createElement("p");
        messageElement.classList.add("login-message");
        messageElement.textContent = message;
        loginPage.appendChild(messageElement);
    }

    // Container para formulário de e-mail/senha
    const emailFormContainer = document.createElement("div");
    emailFormContainer.classList.add("email-form-container");

    // Formulário de login
    const emailForm = document.createElement("form");
    emailForm.classList.add("email-form");
    
    // Campo de e-mail
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "Seu e-mail";
    emailInput.required = true;
    emailInput.classList.add("login-input");
    emailForm.appendChild(emailInput);
    
    // Campo de senha
    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.placeholder = "Sua senha";
    passwordInput.required = true;
    passwordInput.classList.add("login-input");
    emailForm.appendChild(passwordInput);
    
    // Container para botões de login/cadastro
    const formButtonsContainer = document.createElement("div");
    formButtonsContainer.classList.add("form-buttons-container");
    
    // Botão de login
    const loginButton = document.createElement("button");
    loginButton.type = "submit";
    loginButton.classList.add("login-button", "email-login-button");
    loginButton.textContent = "Entrar";
    formButtonsContainer.appendChild(loginButton);
    
    // Botão de cadastro
    const registerButton = document.createElement("button");
    registerButton.type = "button";
    registerButton.classList.add("login-button", "register-button");
    registerButton.textContent = "Cadastrar";
    formButtonsContainer.appendChild(registerButton);
    
    emailForm.appendChild(formButtonsContainer);
    emailFormContainer.appendChild(emailForm);
    
    // Adicionar separador
    const separator = document.createElement("div");
    separator.classList.add("separator");
    separator.innerHTML = '<span>ou</span>';
    
    // Container para botões de login social
    const socialLoginContainer = document.createElement("div");
    socialLoginContainer.classList.add("social-login-container");
    
    // Botão de login com Google
    const googleButton = createLoginButton(
        "Login com Google", 
        "google-login-button",
        "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
    );
    
    // Botão de login com Facebook
    const facebookButton = createLoginButton(
        "Login com Facebook", 
        "facebook-login-button",
        "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg"
    );
    
    socialLoginContainer.appendChild(googleButton);
    socialLoginContainer.appendChild(facebookButton);
    
    // Adicionar todos os elementos à página
    loginPage.appendChild(emailFormContainer);
    loginPage.appendChild(separator);
    loginPage.appendChild(socialLoginContainer);
    
    // Container para mensagens de erro/carregamento
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message-container");
    loginPage.appendChild(messageContainer);
    
    contentDiv.appendChild(loginPage);
    
    // Função para mostrar mensagem de erro
    function showError(message) {
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("error-message");
        errorMessage.textContent = message;
        messageContainer.innerHTML = '';
        messageContainer.appendChild(errorMessage);
        
        // Remover mensagem após 3 segundos
        setTimeout(() => {
            errorMessage.remove();
        }, 3000);
    }
    
    // Função para mostrar mensagem de sucesso e redirecionar
    function showSuccessAndRedirect(user) {
        // Limpar todo o conteúdo
        contentDiv.innerHTML = '';
        
        // Criar container para mensagem de sucesso
        const successContainer = document.createElement("div");
        successContainer.classList.add("success-container");
        
        // Mensagem de sucesso
        const successMessage = document.createElement("div");
        successMessage.classList.add("success-message");
        successMessage.textContent = "Login efetuado com sucesso! Redirecionando...";
        successContainer.appendChild(successMessage);
        
        contentDiv.appendChild(successContainer);
        
        // Após 1.5 segundos, redirecionar para a página de controle
        setTimeout(() => {
            // Atualizar a URL
            history.pushState({ page: 'control' }, null, '/controle');
            
            // Limpar o conteúdo novamente
            contentDiv.innerHTML = '';
            
            // Renderizar a página de controle
            const { cleanup, elements } = renderControlPage(contentDiv);
            return { cleanup, elements };
        }, 1500);
    }
    
    // Função para mostrar indicador de carregamento
    function showLoading(message = "Processando...") {
        const loadingIndicator = document.createElement("div");
        loadingIndicator.classList.add("loading-indicator");
        loadingIndicator.textContent = message;
        messageContainer.innerHTML = '';
        messageContainer.appendChild(loadingIndicator);
        return loadingIndicator;
    }
    
    // Função para desabilitar/habilitar formulário
    function setFormEnabled(enabled) {
        emailInput.disabled = !enabled;
        passwordInput.disabled = !enabled;
        loginButton.disabled = !enabled;
        registerButton.disabled = !enabled;
        googleButton.disabled = !enabled;
        facebookButton.disabled = !enabled;
    }
    
    // Evento de login com e-mail/senha
    emailForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
            showError("Por favor, preencha todos os campos.");
            return;
        }
        
        setFormEnabled(false);
        const loadingIndicator = showLoading("Fazendo login...");
        
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                loadingIndicator.remove();
                showSuccessAndRedirect(userCredential.user);
            })
            .catch((error) => {
                console.error("Erro no login:", error.message);
                let errorMessage = "Erro ao fazer login. Verifique suas credenciais.";
                
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    errorMessage = "E-mail ou senha incorretos.";
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = "Muitas tentativas de login. Tente novamente mais tarde.";
                }
                
                showError(errorMessage);
                setFormEnabled(true);
                loadingIndicator.remove();
            });
    });
    
    // Evento de cadastro
    registerButton.addEventListener('click', () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
            showError("Por favor, preencha todos os campos.");
            return;
        }
        
        if (password.length < 6) {
            showError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        
        setFormEnabled(false);
        const loadingIndicator = showLoading("Criando conta...");
        
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                loadingIndicator.remove();
                showSuccessAndRedirect(userCredential.user);
            })
            .catch((error) => {
                console.error("Erro no cadastro:", error.message);
                let errorMessage = "Erro ao criar conta.";
                
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = "Este e-mail já está em uso.";
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = "E-mail inválido.";
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = "Senha muito fraca.";
                }
                
                showError(errorMessage);
                setFormEnabled(true);
                loadingIndicator.remove();
            });
    });
    
    // Evento de login com Google
    googleButton.addEventListener('click', () => {
        setFormEnabled(false);
        const loadingIndicator = showLoading("Conectando ao Google...");
        
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        
        signInWithPopup(auth, provider)
            .then((result) => {
                loadingIndicator.remove();
                showSuccessAndRedirect(result.user);
            })
            .catch((error) => {
                console.error("Erro no login com Google:", error.message);
                showError("Erro ao fazer login com Google. Tente novamente.");
                setFormEnabled(true);
                loadingIndicator.remove();
            });
    });
    
    // Evento de login com Facebook
    facebookButton.addEventListener('click', () => {
        setFormEnabled(false);
        const loadingIndicator = showLoading("Conectando ao Facebook...");
        
        const auth = getAuth();
        const provider = new FacebookAuthProvider();
        
        signInWithPopup(auth, provider)
            .then((result) => {
                loadingIndicator.remove();
                showSuccessAndRedirect(result.user);
            })
            .catch((error) => {
                console.error("Erro no login com Facebook:", error.message);
                showError("Erro ao fazer login com Facebook. Tente novamente.");
                setFormEnabled(true);
                loadingIndicator.remove();
            });
    });

    return {
        cleanup: () => {
            if (loginPage && loginPage.parentNode) {
                loginPage.remove();
            }
        },
        elements: {}
    };
}

// Função auxiliar para criar botões de login estilizados
function createLoginButton(text, className, iconUrl) {
    const button = document.createElement("button");
    button.classList.add("login-button", className);
    button.type = "button";
    
    // Adicionar ícone se fornecido
    if (iconUrl) {
        const icon = document.createElement("img");
        icon.src = iconUrl;
        icon.alt = "";
        icon.classList.add("login-icon");
        button.appendChild(icon);
    }
    
    const span = document.createElement("span");
    span.textContent = text;
    button.appendChild(span);
    
    return button;
}