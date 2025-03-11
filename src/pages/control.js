import { getDatabase, ref, push, onValue, query, limitToLast, serverTimestamp, set, onDisconnect } from 'firebase/database';
import { getCurrentUser, isAuthenticated } from '../core/auth.js';

// Objeto para rastrear a posição atual da cabeça de impressão
const printerPosition = {
    x: 0,
    y: 0,
    z: 0
};

// Array para armazenar o histórico de comandos recentes (limitado a 3)
const commandHistory = [];

// Função para consultar a posição atual da impressora
function queryPrinterPosition() {
    const statusElement = document.getElementById('status');
    statusElement.textContent = 'Status: Consultando posição atual...';
    
    fetch('https://moon1.nerooh.xyz/printer/objects/query?gcode_move', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Dados de posição recebidos:', data);
        if (data.result && data.result.status && data.result.status.gcode_move) {
            const position = data.result.status.gcode_move.position;
            if (position) {
                printerPosition.x = parseFloat(position[0].toFixed(1));
                printerPosition.y = parseFloat(position[1].toFixed(1));
                printerPosition.z = parseFloat(position[2].toFixed(1));
                
                // Atualizar o status
                statusElement.textContent = `Status: Posição atualizada com sucesso`;
                statusElement.classList.remove('error');
                statusElement.classList.add('success');
                
                // Atualizar a exibição da posição
                document.getElementById('x-position').textContent = `X: ${printerPosition.x}`;
                document.getElementById('y-position').textContent = `Y: ${printerPosition.y}`;
                document.getElementById('z-position').textContent = `Z: ${printerPosition.z}`;
                
                console.log('Posição atualizada:', printerPosition);
            }
        } else {
            statusElement.textContent = 'Status: Não foi possível obter a posição atual';
            statusElement.classList.remove('success');
            statusElement.classList.add('error');
        }
    })
    .catch(error => {
        console.error('Erro ao consultar posição:', error);
        statusElement.textContent = `Status: Erro ao consultar posição - ${error.message}`;
        statusElement.classList.remove('success');
        statusElement.classList.add('error');
    });
}

export function renderControlPage(contentDiv) {
    const controlPanel = document.createElement("div");
    controlPanel.classList.add("control-panel");

    const h2 = document.createElement("h2");
    h2.textContent = "Controle da Impressora";
    controlPanel.appendChild(h2);

    // Container principal que vai conter o controle e o chat lado a lado
    const mainContainer = document.createElement("div");
    mainContainer.classList.add("main-container");

    // Container para os controles da impressora
    const controlContainer = document.createElement("div");
    controlContainer.classList.add("control-container");

    // Container para o feed de vídeo e controles sobrepostos
    const videoContainer = document.createElement("div");
    videoContainer.classList.add("video-container");
    
    // Feed de vídeo
    const videoFeed = document.createElement("img");
    videoFeed.src = "https://cam1.nerooh.xyz/video";
    videoFeed.alt = "Feed da Câmera";
    videoFeed.classList.add("video-feed");
    videoContainer.appendChild(videoFeed);

    // Placeholder para quando o feed não estiver disponível
    const videoPlaceholder = document.createElement("div");
    videoPlaceholder.classList.add("video-placeholder");
    videoPlaceholder.textContent = "O stream de vídeo não está ativo no momento";
    videoPlaceholder.style.display = "none"; // Escondido por padrão
    videoContainer.appendChild(videoPlaceholder);

    // Verificar se o feed carregou ou falhou
    videoFeed.onload = () => {
        videoPlaceholder.style.display = "none";
        videoFeed.style.display = "block";
    };
    videoFeed.onerror = () => {
        videoFeed.style.display = "none";
        videoPlaceholder.style.display = "flex";
    };

    // Adicionar exibição da posição atual no feed de vídeo
    const positionDisplay = document.createElement("div");
    positionDisplay.classList.add("position-display-overlay");
    positionDisplay.id = "position-display";

    const positionValues = document.createElement("div");
    positionValues.classList.add("position-values-overlay");

    const xPosition = document.createElement("span");
    xPosition.classList.add("position-value-overlay", "x-position-overlay");
    xPosition.id = "x-position";
    xPosition.textContent = "X: 0.0";
    positionValues.appendChild(xPosition);

    const yPosition = document.createElement("span");
    yPosition.classList.add("position-value-overlay", "y-position-overlay");
    yPosition.id = "y-position";
    yPosition.textContent = "Y: 0.0";
    positionValues.appendChild(yPosition);

    const zPosition = document.createElement("span");
    zPosition.classList.add("position-value-overlay", "z-position-overlay");
    zPosition.id = "z-position";
    zPosition.textContent = "Z: 0.0";
    positionValues.appendChild(zPosition);

    positionDisplay.appendChild(positionValues);
    videoContainer.appendChild(positionDisplay);

    // Joystick XY (canto inferior esquerdo)
    const joystick = document.createElement("div");
    joystick.classList.add("joystick");

    const yPlus = document.createElement("button");
    yPlus.classList.add("control-button", "y-plus");
    yPlus.textContent = "Y+";
    yPlus.onclick = (e) => handleControlButtonClick(e, 'y', 'plus');
    joystick.appendChild(yPlus);

    const yMinus = document.createElement("button");
    yMinus.classList.add("control-button", "y-minus");
    yMinus.textContent = "Y-";
    yMinus.onclick = (e) => handleControlButtonClick(e, 'y', 'minus');
    joystick.appendChild(yMinus);

    const xMinus = document.createElement("button");
    xMinus.classList.add("control-button", "x-minus");
    xMinus.textContent = "X-";
    xMinus.onclick = (e) => handleControlButtonClick(e, 'x', 'minus');
    joystick.appendChild(xMinus);

    const xPlus = document.createElement("button");
    xPlus.classList.add("control-button", "x-plus");
    xPlus.textContent = "X+";
    xPlus.onclick = (e) => handleControlButtonClick(e, 'x', 'plus');
    joystick.appendChild(xPlus);

    // Adicionar joystick ao container de vídeo
    videoContainer.appendChild(joystick);

    // Botões Z e Home (canto inferior direito)
    const zHomeButtons = document.createElement("div");
    zHomeButtons.classList.add("z-home-buttons");

    const zPlus = document.createElement("button");
    zPlus.classList.add("control-button", "z-plus");
    zPlus.textContent = "Z+";
    zPlus.onclick = (e) => handleControlButtonClick(e, 'z', 'plus');
    zHomeButtons.appendChild(zPlus);

    const zMinus = document.createElement("button");
    zMinus.classList.add("control-button", "z-minus");
    zMinus.textContent = "Z-";
    zMinus.onclick = (e) => handleControlButtonClick(e, 'z', 'minus');
    zHomeButtons.appendChild(zMinus);

    const home = document.createElement("button");
    home.classList.add("control-button", "home");
    home.textContent = "Home";
    home.onclick = (e) => handleControlButtonClick(e, 'home', null);
    zHomeButtons.appendChild(home);

    // Adicionar botões Z/Home ao container de vídeo
    videoContainer.appendChild(zHomeButtons);
    
    // Adicionar o container de vídeo ao container de controle
    controlContainer.appendChild(videoContainer);

    // Console G-code abaixo do feed de vídeo
    const gcodeConsole = document.createElement("div");
    gcodeConsole.classList.add("gcode-console");

    const gcodeInput = document.createElement("input");
    gcodeInput.type = "text";
    gcodeInput.id = "gcodeInput";
    gcodeInput.classList.add("gcode-input");
    gcodeInput.placeholder = "Digite comando G-code";
    gcodeConsole.appendChild(gcodeInput);

    const gcodeSubmit = document.createElement("button");
    gcodeSubmit.classList.add("gcode-submit");
    gcodeSubmit.textContent = "Enviar";
    gcodeSubmit.onclick = handleGcodeSubmit;
    gcodeConsole.appendChild(gcodeSubmit);

    // Botão para atualizar a posição
    const updatePositionButton = document.createElement("button");
    updatePositionButton.classList.add("update-position-button");
    updatePositionButton.textContent = "Atualizar Posição";
    updatePositionButton.onclick = () => {
        if (!isAuthenticated()) {
            showLoginMessage("Para atualizar a posição, por favor faça login");
            return;
        }
        queryPrinterPosition();
    };
    gcodeConsole.appendChild(updatePositionButton);

    controlContainer.appendChild(gcodeConsole);

    const status = document.createElement("div");
    status.classList.add("control-status");
    status.id = "status";
    status.textContent = "Status: Aguardando comando...";
    controlContainer.appendChild(status);

    // Adicionar container para histórico de comandos
    const commandHistoryContainer = document.createElement("div");
    commandHistoryContainer.classList.add("command-history-container");
    commandHistoryContainer.id = "command-history";
    
    // Título do histórico de comandos
    const commandHistoryTitle = document.createElement("div");
    commandHistoryTitle.classList.add("command-history-title");
    commandHistoryTitle.textContent = "Últimos Comandos:";
    commandHistoryContainer.appendChild(commandHistoryTitle);
    
    // Lista de comandos
    const commandList = document.createElement("div");
    commandList.classList.add("command-list");
    commandList.id = "command-list";
    commandHistoryContainer.appendChild(commandList);
    
    controlContainer.appendChild(commandHistoryContainer);

    // Container para o chat
    const chatContainer = document.createElement("div");
    chatContainer.classList.add("chat-container");

    // Título do chat
    const chatTitle = document.createElement("h3");
    chatTitle.textContent = "Chat";
    chatTitle.classList.add("chat-title");
    chatContainer.appendChild(chatTitle);

    // Área de mensagens
    const messagesArea = document.createElement("div");
    messagesArea.classList.add("messages-area");
    chatContainer.appendChild(messagesArea);

    // Formulário de envio de mensagens
    const chatForm = document.createElement("form");
    chatForm.classList.add("chat-form");

    const messageInput = document.createElement("input");
    messageInput.type = "text";
    messageInput.classList.add("message-input");
    messageInput.placeholder = "Digite sua mensagem...";
    // Verificar autenticação ao focar no input
    messageInput.addEventListener('focus', (e) => {
        if (!isAuthenticated()) {
            e.preventDefault();
            messageInput.blur();
            showLoginMessage("Para enviar mensagens no chat, por favor faça login");
        }
    });
    chatForm.appendChild(messageInput);

    const sendButton = document.createElement("button");
    sendButton.type = "submit";
    sendButton.classList.add("send-button");
    sendButton.textContent = "Enviar";
    chatForm.appendChild(sendButton);

    chatContainer.appendChild(chatForm);

    // Adicionar os containers ao container principal
    mainContainer.appendChild(controlContainer);
    mainContainer.appendChild(chatContainer);
    
    // Adicionar o container principal ao painel de controle
    controlPanel.appendChild(mainContainer);

    // Adicionar o painel de controle ao conteúdo
    contentDiv.appendChild(controlPanel);

    // Inicializar o chat
    initChat(messagesArea, chatForm, messageInput);

    // Consultar a posição atual da impressora
    queryPrinterPosition();

    // Carregar histórico de comandos do Firebase
    loadCommandHistory();

    // Container para mensagem de login
    const loginMessageContainer = document.createElement("div");
    loginMessageContainer.id = "login-message-container";
    loginMessageContainer.classList.add("login-message-container");
    loginMessageContainer.style.display = "none";
    document.body.appendChild(loginMessageContainer);

    return {
        cleanup: () => {
            console.log('Executando limpeza da página de controle');
            
            // Limpar listeners do chat quando a página for desmontada
            if (window.chatUnsubscribe) {
                console.log('Removendo listeners do chat');
                window.chatUnsubscribe();
                window.chatUnsubscribe = null;
            }
            
            // Remover status de digitando ao sair
            const user = getCurrentUser();
            if (user) {
                console.log('Removendo status de digitando para o usuário:', user.uid);
                const db = getDatabase();
                const typingRef = ref(db, `typing/${user.uid}`);
                set(typingRef, null);
            }
            
            // Remover container de mensagem de login
            if (loginMessageContainer && loginMessageContainer.parentNode) {
                console.log('Removendo container de mensagem de login');
                loginMessageContainer.remove();
            }
            
            // Remover o painel de controle
            if (controlPanel && controlPanel.parentNode) {
                console.log('Removendo painel de controle');
                controlPanel.remove();
            }
            
            // Limpar quaisquer outros elementos que possam ter sido criados
            const existingLoginContainers = document.querySelectorAll('.login-message-container');
            existingLoginContainers.forEach(container => {
                if (container !== loginMessageContainer) {
                    console.log('Removendo container de login adicional');
                    container.remove();
                }
            });
            
            console.log('Limpeza da página de controle concluída');
        },
        elements: {}
    };
}

// Função para lidar com cliques nos botões de controle
function handleControlButtonClick(event, axis, direction) {
    if (!isAuthenticated()) {
        event.preventDefault();
        showLoginMessage("Para controlar a impressora, por favor faça login");
        return;
    }
    
    // Incrementar ou decrementar a posição em 10mm
    const increment = direction === 'plus' ? 10 : -10;
    
    if (axis === 'home') {
        // Comando Home (G28) não altera a posição relativa
        sendCommand('G28');
        // Resetar posições rastreadas após home
        printerPosition.x = 0;
        printerPosition.y = 0;
        printerPosition.z = 0;
        return;
    }
    
    // Atualizar a posição
    printerPosition[axis] += increment;
    
    // Criar comando G-code com a posição absoluta
    let gcode;
    if (axis === 'x') {
        gcode = `G0 X${printerPosition.x}`;
    } else if (axis === 'y') {
        gcode = `G0 Y${printerPosition.y}`;
    } else if (axis === 'z') {
        gcode = `G0 Z${printerPosition.z}`;
    }
    
    // Enviar o comando
    sendCommand(gcode);
}

// Função para lidar com envio de comandos G-code
function handleGcodeSubmit() {
    if (!isAuthenticated()) {
        showLoginMessage("Para enviar comandos G-code, por favor faça login");
        return;
    }
    const gcode = document.getElementById('gcodeInput').value;
    if (gcode) {
        sendCommand(gcode);
        document.getElementById('gcodeInput').value = '';
    }
}

// Função para mostrar mensagem de login
function showLoginMessage(message) {
    // Verificar se o usuário já está autenticado
    if (isAuthenticated()) {
        console.log('Usuário já está autenticado, não mostrando mensagem de login');
        return;
    }
    
    const container = document.getElementById('login-message-container');
    if (!container) return;
    
    // Limpar conteúdo anterior
    container.innerHTML = '';
    
    // Criar conteúdo da mensagem
    const messageContent = document.createElement("div");
    messageContent.classList.add("login-message-content");
    
    const messageText = document.createElement("span");
    messageText.textContent = message;
    messageContent.appendChild(messageText);
    
    const loginIcon = document.createElement("button");
    loginIcon.classList.add("login-icon-button");
    loginIcon.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    loginIcon.onclick = () => {
        container.style.display = "none";
        history.pushState({ page: 'login' }, null, '/login');
        // Usar loadRoute diretamente em vez de disparar um evento popstate
        window.dispatchEvent(new CustomEvent('route-change'));
    };
    messageContent.appendChild(loginIcon);
    
    container.appendChild(messageContent);
    container.style.display = "flex";
    
    // Fechar mensagem após 5 segundos
    setTimeout(() => {
        container.style.display = "none";
    }, 5000);
    
    // Permitir fechar a mensagem clicando nela
    container.onclick = (e) => {
        if (e.target === container) {
            container.style.display = "none";
        }
    };
}

// Função para inicializar o chat
function initChat(messagesArea, chatForm, messageInput) {
    const db = getDatabase();
    const messagesRef = ref(db, 'messages');
    const messagesQuery = query(messagesRef, limitToLast(50));
    
    // Referência para usuários digitando
    const typingRef = ref(db, 'typing');
    
    // Objeto para armazenar timeouts de digitação
    const typingTimeouts = {};
    
    // Elemento para mostrar quem está digitando
    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("message-typing");
    typingIndicator.style.display = "none";
    messagesArea.appendChild(typingIndicator);

    // Carregar mensagens existentes e escutar por novas
    const messagesUnsubscribe = onValue(messagesQuery, (snapshot) => {
        // Limpar área de mensagens
        messagesArea.innerHTML = '';
        
        // Verificar se há mensagens
        if (snapshot.exists()) {
            const messages = [];
            snapshot.forEach((childSnapshot) => {
                messages.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            
            // Renderizar mensagens
            messages.forEach(message => {
                const messageElement = createMessageElement(message);
                messagesArea.appendChild(messageElement);
            });
            
            // Adicionar indicador de digitação de volta
            messagesArea.appendChild(typingIndicator);
            
            // Rolar para a última mensagem
            messagesArea.scrollTop = messagesArea.scrollHeight;
        } else {
            // Mostrar mensagem quando não há mensagens
            const emptyMessage = document.createElement("div");
            emptyMessage.classList.add("empty-message");
            emptyMessage.textContent = "Nenhuma mensagem ainda. Seja o primeiro a enviar!";
            messagesArea.appendChild(emptyMessage);
            
            // Adicionar indicador de digitação de volta
            messagesArea.appendChild(typingIndicator);
        }
    });
    
    // Monitorar usuários digitando
    const typingUnsubscribe = onValue(typingRef, (snapshot) => {
        if (!snapshot.exists()) {
            typingIndicator.style.display = "none";
            return;
        }
        
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const typingUsers = [];
        snapshot.forEach(childSnapshot => {
            const userId = childSnapshot.key;
            const userData = childSnapshot.val();
            
            // Não mostrar o próprio usuário digitando
            if (userId !== currentUser.uid && userData) {
                typingUsers.push(userData.name);
            }
        });
        
        if (typingUsers.length === 0) {
            typingIndicator.style.display = "none";
        } else if (typingUsers.length === 1) {
            typingIndicator.innerHTML = `
                <span>${typingUsers[0]} está digitando</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
            typingIndicator.style.display = "flex";
        } else if (typingUsers.length === 2) {
            typingIndicator.innerHTML = `
                <span>${typingUsers[0]} e ${typingUsers[1]} estão digitando</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
            typingIndicator.style.display = "flex";
        } else {
            typingIndicator.innerHTML = `
                <span>Várias pessoas estão digitando</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
            typingIndicator.style.display = "flex";
        }
        
        // Rolar para a última mensagem quando alguém está digitando
        messagesArea.scrollTop = messagesArea.scrollHeight;
    });
    
    // Combinar unsubscribes
    window.chatUnsubscribe = () => {
        messagesUnsubscribe();
        typingUnsubscribe();
    };

    // Configurar envio de mensagens
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!isAuthenticated()) {
            showLoginMessage("Para enviar mensagens no chat, por favor faça login");
            return;
        }
        
        const messageText = messageInput.value.trim();
        if (!messageText) return;
        
        const user = getCurrentUser();
        if (!user) {
            showLoginMessage("Para enviar mensagens no chat, por favor faça login");
            return;
        }
        
        // Criar objeto de mensagem
        const message = {
            text: messageText,
            userId: user.uid,
            userName: user.displayName || 'Usuário',
            userPhotoURL: user.photoURL || '/default-avatar.svg',
            timestamp: serverTimestamp()
        };
        
        // Enviar mensagem para o Firebase
        push(messagesRef, message)
            .then(() => {
                // Limpar input após envio bem-sucedido
                messageInput.value = '';
                
                // Remover status de digitando
                const typingUserRef = ref(db, `typing/${user.uid}`);
                set(typingUserRef, null);
            })
            .catch(error => {
                console.error("Erro ao enviar mensagem:", error);
                alert("Erro ao enviar mensagem. Tente novamente.");
            });
    });
    
    // Configurar evento de digitação
    let typingTimeout = null;
    messageInput.addEventListener('input', () => {
        const user = getCurrentUser();
        if (!user) return;
        
        // Atualizar status de digitando
        const typingUserRef = ref(db, `typing/${user.uid}`);
        set(typingUserRef, {
            name: user.displayName || 'Usuário',
            timestamp: serverTimestamp()
        });
        
        // Limpar timeout anterior
        if (typingTimeout) clearTimeout(typingTimeout);
        
        // Configurar novo timeout para remover status após 3 segundos de inatividade
        typingTimeout = setTimeout(() => {
            set(typingUserRef, null);
        }, 3000);
    });
    
    // Configurar limpeza automática do status de digitando quando o usuário se desconectar
    const user = getCurrentUser();
    if (user) {
        const typingUserRef = ref(db, `typing/${user.uid}`);
        onDisconnect(typingUserRef).remove();
    }
}

// Função para criar elemento de mensagem
function createMessageElement(message) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    
    // Verificar se é uma mensagem do sistema (comando)
    if (message.isSystemMessage) {
        messageElement.classList.add("system-message");
        
        // Verificar se é um comando bem-sucedido ou com erro
        if (message.text.includes("❌")) {
            messageElement.classList.add("error-command");
        } else {
            messageElement.classList.add("success-command");
        }
    } else {
        // Verificar se a mensagem é do usuário atual
        const currentUser = getCurrentUser();
        if (currentUser && message.userId === currentUser.uid) {
            messageElement.classList.add("own-message");
        }
    }
    
    // Avatar do usuário
    const avatar = document.createElement("img");
    avatar.src = message.userPhotoURL || '/default-avatar.svg';
    avatar.alt = message.userName;
    avatar.classList.add("message-avatar");
    messageElement.appendChild(avatar);
    
    // Conteúdo da mensagem
    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");
    
    // Nome do usuário
    const userName = document.createElement("div");
    userName.classList.add("message-username");
    userName.textContent = message.userName;
    messageContent.appendChild(userName);
    
    // Texto da mensagem
    const messageText = document.createElement("div");
    messageText.classList.add("message-text");
    messageText.textContent = message.text;
    messageContent.appendChild(messageText);
    
    // Horário da mensagem
    if (message.timestamp) {
        const timestamp = document.createElement("div");
        timestamp.classList.add("message-timestamp");
        
        // Converter timestamp para formato legível
        let date;
        if (typeof message.timestamp === 'object' && message.timestamp !== null) {
            // Lidar com o formato do Firebase Realtime Database
            date = new Date(message.timestamp);
        } else {
            // Lidar com o formato de timestamp do servidor
            date = new Date(message.timestamp);
        }
        
        if (!isNaN(date.getTime())) {
            timestamp.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        messageContent.appendChild(timestamp);
    }
    
    messageElement.appendChild(messageContent);
    
    return messageElement;
}

// Função para carregar o histórico de comandos do Firebase
function loadCommandHistory() {
    const db = getDatabase();
    const commandsRef = ref(db, 'commands');
    const recentCommandsQuery = query(commandsRef, limitToLast(3));
    
    onValue(recentCommandsQuery, (snapshot) => {
        // Limpar o array de histórico
        commandHistory.length = 0;
        
        // Limpar a lista de comandos na interface
        const commandList = document.getElementById('command-list');
        if (!commandList) return;
        
        commandList.innerHTML = '';
        
        // Verificar se há comandos
        if (snapshot.exists()) {
            const commands = [];
            snapshot.forEach((childSnapshot) => {
                commands.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            
            // Ordenar comandos por timestamp (mais recente primeiro)
            commands.sort((a, b) => {
                const timeA = a.timestamp ? new Date(a.timestamp) : new Date(0);
                const timeB = b.timestamp ? new Date(b.timestamp) : new Date(0);
                return timeB - timeA;
            });
            
            // Limitar a 3 comandos
            const recentCommands = commands.slice(0, 3);
            
            // Adicionar ao array de histórico
            commandHistory.push(...recentCommands);
            
            // Renderizar comandos na interface
            recentCommands.forEach(command => {
                const commandElement = createCommandElement(command);
                commandList.appendChild(commandElement);
            });
            
            // Adicionar botão para ver histórico completo
            const viewAllButton = document.createElement("button");
            viewAllButton.classList.add("view-all-commands");
            viewAllButton.textContent = "Ver Histórico Completo";
            viewAllButton.onclick = showFullCommandHistory;
            commandList.appendChild(viewAllButton);
        } else {
            // Mostrar mensagem quando não há comandos
            const emptyMessage = document.createElement("div");
            emptyMessage.classList.add("empty-command");
            emptyMessage.textContent = "Nenhum comando executado ainda.";
            commandList.appendChild(emptyMessage);
        }
    });
}

// Função para mostrar o histórico completo de comandos em um modal
function showFullCommandHistory() {
    if (!isAuthenticated()) {
        showLoginMessage("Para visualizar o histórico completo, por favor faça login");
        return;
    }
    
    // Criar o modal
    const modal = document.createElement("div");
    modal.classList.add("command-history-modal");
    
    // Container do modal
    const modalContent = document.createElement("div");
    modalContent.classList.add("command-history-modal-content");
    
    // Cabeçalho do modal
    const modalHeader = document.createElement("div");
    modalHeader.classList.add("command-history-modal-header");
    
    const modalTitle = document.createElement("h3");
    modalTitle.textContent = "Histórico Completo de Comandos";
    modalHeader.appendChild(modalTitle);
    
    const closeButton = document.createElement("button");
    closeButton.classList.add("close-modal-button");
    closeButton.innerHTML = "&times;";
    closeButton.onclick = () => modal.remove();
    modalHeader.appendChild(closeButton);
    
    modalContent.appendChild(modalHeader);
    
    // Corpo do modal
    const modalBody = document.createElement("div");
    modalBody.classList.add("command-history-modal-body");
    
    // Filtros
    const filtersContainer = document.createElement("div");
    filtersContainer.classList.add("command-filters");
    
    const filterLabel = document.createElement("span");
    filterLabel.textContent = "Filtrar por: ";
    filtersContainer.appendChild(filterLabel);
    
    const allFilter = document.createElement("button");
    allFilter.classList.add("command-filter", "active");
    allFilter.textContent = "Todos";
    allFilter.onclick = () => filterCommands('all', allFilter);
    filtersContainer.appendChild(allFilter);
    
    const successFilter = document.createElement("button");
    successFilter.classList.add("command-filter");
    successFilter.textContent = "Sucesso";
    successFilter.onclick = () => filterCommands('success', successFilter);
    filtersContainer.appendChild(successFilter);
    
    const errorFilter = document.createElement("button");
    errorFilter.classList.add("command-filter");
    errorFilter.textContent = "Erro";
    errorFilter.onclick = () => filterCommands('error', errorFilter);
    filtersContainer.appendChild(errorFilter);
    
    modalBody.appendChild(filtersContainer);
    
    // Lista de comandos
    const commandsList = document.createElement("div");
    commandsList.classList.add("full-command-list");
    modalBody.appendChild(commandsList);
    
    // Adicionar loading
    const loadingIndicator = document.createElement("div");
    loadingIndicator.classList.add("loading-commands");
    loadingIndicator.textContent = "Carregando histórico...";
    commandsList.appendChild(loadingIndicator);
    
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Carregar histórico completo
    loadFullCommandHistory(commandsList);
    
    // Função para filtrar comandos
    function filterCommands(filterType, button) {
        // Atualizar botões de filtro
        document.querySelectorAll('.command-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Filtrar comandos
        const items = commandsList.querySelectorAll('.command-item');
        items.forEach(item => {
            if (filterType === 'all') {
                item.style.display = 'flex';
            } else if (filterType === 'success') {
                item.style.display = item.classList.contains('error-command') ? 'none' : 'flex';
            } else if (filterType === 'error') {
                item.style.display = item.classList.contains('error-command') ? 'flex' : 'none';
            }
        });
    }
}

// Função para carregar o histórico completo de comandos
function loadFullCommandHistory(container) {
    const db = getDatabase();
    const commandsRef = ref(db, 'commands');
    const allCommandsQuery = query(commandsRef, limitToLast(100)); // Limitar a 100 comandos para performance
    
    onValue(allCommandsQuery, (snapshot) => {
        // Limpar o container
        container.innerHTML = '';
        
        // Verificar se há comandos
        if (snapshot.exists()) {
            const commands = [];
            snapshot.forEach((childSnapshot) => {
                commands.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            
            // Ordenar comandos por timestamp (mais recente primeiro)
            commands.sort((a, b) => {
                const timeA = a.timestamp ? new Date(a.timestamp) : new Date(0);
                const timeB = b.timestamp ? new Date(b.timestamp) : new Date(0);
                return timeB - timeA;
            });
            
            // Adicionar cabeçalho da tabela
            const tableHeader = document.createElement("div");
            tableHeader.classList.add("command-table-header");
            
            const statusHeader = document.createElement("div");
            statusHeader.classList.add("command-header", "status-header");
            statusHeader.textContent = "Status";
            tableHeader.appendChild(statusHeader);
            
            const userHeader = document.createElement("div");
            userHeader.classList.add("command-header", "user-header");
            userHeader.textContent = "Usuário";
            tableHeader.appendChild(userHeader);
            
            const commandHeader = document.createElement("div");
            commandHeader.classList.add("command-header", "command-header");
            commandHeader.textContent = "Comando";
            tableHeader.appendChild(commandHeader);
            
            const timeHeader = document.createElement("div");
            timeHeader.classList.add("command-header", "time-header");
            timeHeader.textContent = "Horário";
            tableHeader.appendChild(timeHeader);
            
            container.appendChild(tableHeader);
            
            // Renderizar comandos
            commands.forEach(command => {
                const commandElement = createFullCommandElement(command);
                container.appendChild(commandElement);
            });
            
            // Adicionar informação sobre a quantidade de comandos
            const commandCount = document.createElement("div");
            commandCount.classList.add("command-count");
            commandCount.textContent = `Total: ${commands.length} comandos`;
            container.appendChild(commandCount);
        } else {
            // Mostrar mensagem quando não há comandos
            const emptyMessage = document.createElement("div");
            emptyMessage.classList.add("empty-command");
            emptyMessage.textContent = "Nenhum comando executado ainda.";
            container.appendChild(emptyMessage);
        }
    });
}

// Função para criar elemento de comando para o histórico
function createCommandElement(command) {
    const commandElement = document.createElement("div");
    commandElement.classList.add("command-item");
    
    if (!command.success) {
        commandElement.classList.add("error-command");
    }
    
    // Ícone de status
    const statusIcon = document.createElement("span");
    statusIcon.classList.add("command-status-icon");
    statusIcon.textContent = command.success ? "✓" : "✗";
    commandElement.appendChild(statusIcon);
    
    // Informações do comando
    const commandInfo = document.createElement("div");
    commandInfo.classList.add("command-info");
    
    // Usuário que enviou o comando
    const userInfo = document.createElement("div");
    userInfo.classList.add("command-user");
    userInfo.textContent = command.userName;
    commandInfo.appendChild(userInfo);
    
    // Texto do comando
    const commandText = document.createElement("div");
    commandText.classList.add("command-text");
    commandText.textContent = command.command;
    commandInfo.appendChild(commandText);
    
    // Horário do comando
    if (command.timestamp) {
        const timestamp = document.createElement("div");
        timestamp.classList.add("command-timestamp");
        
        // Converter timestamp para formato legível
        let date;
        if (typeof command.timestamp === 'object' && command.timestamp !== null) {
            // Lidar com o formato do Firebase Realtime Database
            date = new Date(command.timestamp);
        } else {
            // Lidar com o formato de timestamp do servidor
            date = new Date(command.timestamp);
        }
        
        if (!isNaN(date.getTime())) {
            timestamp.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        commandInfo.appendChild(timestamp);
    }
    
    commandElement.appendChild(commandInfo);
    
    return commandElement;
}

// Função para criar elemento de comando para o histórico completo
function createFullCommandElement(command) {
    const commandElement = document.createElement("div");
    commandElement.classList.add("command-item", "full-command-item");
    
    if (!command.success) {
        commandElement.classList.add("error-command");
    }
    
    // Status
    const statusCell = document.createElement("div");
    statusCell.classList.add("command-cell", "status-cell");
    
    const statusIcon = document.createElement("span");
    statusIcon.classList.add("command-status-icon");
    statusIcon.textContent = command.success ? "✓" : "✗";
    statusCell.appendChild(statusIcon);
    
    commandElement.appendChild(statusCell);
    
    // Usuário
    const userCell = document.createElement("div");
    userCell.classList.add("command-cell", "user-cell");
    userCell.textContent = command.userName;
    commandElement.appendChild(userCell);
    
    // Comando
    const commandCell = document.createElement("div");
    commandCell.classList.add("command-cell", "command-text-cell");
    commandCell.textContent = command.command;
    
    // Adicionar mensagem de erro se houver
    if (!command.success && command.errorMessage) {
        const errorInfo = document.createElement("div");
        errorInfo.classList.add("command-error-info");
        errorInfo.textContent = `Erro: ${command.errorMessage}`;
        commandCell.appendChild(errorInfo);
    }
    
    commandElement.appendChild(commandCell);
    
    // Horário
    const timeCell = document.createElement("div");
    timeCell.classList.add("command-cell", "time-cell");
    
    if (command.timestamp) {
        let date;
        if (typeof command.timestamp === 'object' && command.timestamp !== null) {
            date = new Date(command.timestamp);
        } else {
            date = new Date(command.timestamp);
        }
        
        if (!isNaN(date.getTime())) {
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            timeCell.textContent = `${formattedDate} ${formattedTime}`;
        }
    }
    
    commandElement.appendChild(timeCell);
    
    return commandElement;
}

function sendCommand(gcode) {
    console.log(`Enviando comando: ${gcode}`);
    const statusElement = document.getElementById('status');
    statusElement.textContent = `Status: Enviando comando ${gcode}...`;
    statusElement.classList.remove('success', 'error');
    
    // Obter o usuário atual para registrar quem enviou o comando
    const user = getCurrentUser();
    const userName = user ? (user.displayName || user.email || 'Usuário') : 'Usuário não autenticado';
    
    fetch('https://moon1.nerooh.xyz/printer/gcode/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: gcode })
    })
    .then(response => {
        console.log('Resposta recebida:', response);
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.error?.message || `Erro HTTP: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Dados recebidos:', data);
        if (data.result === "ok") {
            statusElement.textContent = `Status: Comando ${gcode} executado com sucesso`;
            statusElement.classList.remove('error');
            statusElement.classList.add('success');
            
            // Registrar o comando bem-sucedido no console
            console.log(`COMANDO: ${userName} executou: ${gcode}`);
            
            // Registrar o comando no banco de dados
            const db = getDatabase();
            const commandsRef = ref(db, 'commands');
            push(commandsRef, {
                command: gcode,
                userId: user ? user.uid : 'anônimo',
                userName: userName,
                timestamp: serverTimestamp(),
                success: true
            });
            
            // Atualizar a posição após o envio bem-sucedido
            setTimeout(queryPrinterPosition, 500);
        } else if (data.error) {
            const errorMessage = data.error.message || 'Erro desconhecido';
            statusElement.textContent = `Status: Erro - ${errorMessage}`;
            statusElement.classList.remove('success');
            statusElement.classList.add('error');
            
            // Registrar o erro no console
            console.error(`ERRO DE COMANDO: ${userName} tentou: ${gcode} - Erro: ${errorMessage}`);
            
            // Registrar o comando com erro no banco de dados
            const db = getDatabase();
            const commandsRef = ref(db, 'commands');
            push(commandsRef, {
                command: gcode,
                userId: user ? user.uid : 'anônimo',
                userName: userName,
                timestamp: serverTimestamp(),
                success: false,
                errorMessage: errorMessage
            });
        }
    })
    .catch(error => {
        console.error('Erro ao enviar comando:', error);
        // Exibir a mensagem de erro específica
        statusElement.textContent = `Status: Erro - ${error.message || 'Falha na conexão'}`;
        statusElement.classList.remove('success');
        statusElement.classList.add('error');
        
        // Registrar o erro no console
        console.error(`ERRO DE COMANDO: ${userName} tentou: ${gcode} - Erro: ${error.message}`);
        
        // Registrar o comando com erro no banco de dados
        const db = getDatabase();
        const commandsRef = ref(db, 'commands');
        push(commandsRef, {
            command: gcode,
            userId: user ? user.uid : 'anônimo',
            userName: userName,
            timestamp: serverTimestamp(),
            success: false,
            errorMessage: error.message || 'Falha na conexão'
        });
    });
}