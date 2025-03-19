(function() {
    // Styles remain the same as before
    const styles = `
        .chat-widget-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 24px;
            z-index: 1000;
        }
        .chat-widget-button:hover {
            transform: scale(1.1) rotate(10deg);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
        }
        .chat-widget-container {
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: 380px;
            height: 600px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .chat-widget-header {
            padding: 20px;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            font-weight: 600;
            font-size: 1.1em;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .chat-widget-header::before {
            content: '🤖';
            font-size: 1.2em;
        }
        .chat-widget-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f8fafc;
            scroll-behavior: smooth;
        }
        .chat-widget-messages::-webkit-scrollbar {
            width: 6px;
        }
        .chat-widget-messages::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
        }
        .chat-message {
            margin-bottom: 15px;
            padding: 12px 16px;
            border-radius: 12px;
            max-width: 85%;
            font-size: 0.95em;
            line-height: 1.4;
            animation: messageIn 0.3s ease-out;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        @keyframes messageIn {
            from { transform: translateY(10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .user-message {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            margin-left: auto;
            border-bottom-right-radius: 4px;
        }
        .bot-message {
            background: white;
            border-bottom-left-radius: 4px;
        }
        .chat-widget-input {
            padding: 20px;
            background: white;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 10px;
        }
        .chat-widget-input input {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 0.95em;
            transition: all 0.2s ease;
            outline: none;
        }
        .chat-widget-input input:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .chat-widget-input button {
            padding: 12px 20px;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        .chat-widget-input button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .chat-widget-input button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        .loading-dots {
            display: inline-block;
            padding-left: 4px;
        }
        .loading-dots:after {
            content: '';
            animation: dots 1.4s linear infinite;
            font-size: 1.2em;
        }
        @keyframes dots {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60% { content: '...'; }
            80%, 100% { content: ''; }
        }
        @media (max-width: 480px) {
            .chat-widget-container {
                width: 100%;
                height: 100%;
                bottom: 0;
                right: 0;
                border-radius: 0;
            }
            .chat-widget-button {
                bottom: 10px;
                right: 10px;
            }
        }
    `;

    // Add styles to head
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create chat widget HTML
    const chatButton = document.createElement('button');
    chatButton.className = 'chat-widget-button';
    chatButton.innerHTML = '💬';

    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-widget-container';
    chatButton.innerHTML = '👋';
    chatContainer.innerHTML = `
        <div class="chat-widget-header">AI Assistant - Seagate Tech</div>
        <div class="chat-widget-messages"></div>
        <div class="chat-widget-input">
            <input type="text" placeholder="Type your message here...">
            <button>Send</button>
        </div>
    `;

    // Add elements to body
    document.body.appendChild(chatButton);
    document.body.appendChild(chatContainer);

    // Chat widget functionality
    let isOpen = false;
    const messages = chatContainer.querySelector('.chat-widget-messages');
    const input = chatContainer.querySelector('input');
    const sendButton = chatContainer.querySelector('button');
    let isWaitingForResponse = false;

    chatButton.addEventListener('click', () => {
        isOpen = !isOpen;
        chatContainer.style.display = isOpen ? 'flex' : 'none';
        if (isOpen) input.focus();
    });

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = content;
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    function addLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message bot-message';
        loadingDiv.innerHTML = 'Thinking<span class="loading-dots"></span>';
        loadingDiv.id = 'loading-indicator';
        messages.appendChild(loadingDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    function removeLoadingIndicator() {
        const loadingDiv = messages.querySelector('#loading-indicator');
        if (loadingDiv) loadingDiv.remove();
    }

    async function initializeWidget() {
        try {
            if (!window.chatbotConfig || !window.chatbotConfig.domain) {
                console.error('❌ Missing chatbot configuration', {
                    config: window.chatbotConfig
                });
                return false;
            }

            const domain = window.chatbotConfig.domain.replace(/\/$/, '');
            const currentHost = window.location.host.toLowerCase();
            const allowedDomain = window.chatbotConfig.allowedDomain?.toLowerCase();

            console.log('🔍 Checking domain authorization:', {
                currentHost,
                allowedDomain,
                match: currentHost === allowedDomain
            });

            if (allowedDomain && currentHost !== allowedDomain) {
                console.error('❌ Domain mismatch. Widget not authorized.', {
                    current: currentHost,
                    allowed: allowedDomain
                });
                // Remove widget elements if domain mismatch
                const button = document.querySelector('.chat-widget-button');
                const container = document.querySelector('.chat-widget-container');
                if (button) button.remove();
                if (container) container.remove();
                return false;
            }

            const response = await fetch(`${domain}/api/widget-auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    domain: currentHost
                }),
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const authData = await response.json();
            
            if (!authData.success) {
                throw new Error('Authentication failed');
            }

            window.chatbotConfig.sessionToken = authData.sessionToken;
            window.chatbotConfig.domain = domain;

            // Initialize chat after successful auth
            addMessage('Hello! How can I help you today?');
        } catch (error) {
            console.error('Failed to initialize widget:', error);
        }
    }

    // Add this variable at the top of the widget functionality section
    let conversationHistory = [];
    let currentLeadId = null; // Add this line to store the leadId
    
    // Modify the sendMessage function
    async function sendMessage(message) {
        if (isWaitingForResponse) return;
        
        addMessage(message, true);
        addLoadingIndicator();
        isWaitingForResponse = true;
        input.disabled = true;
        sendButton.disabled = true;
    
        try {
            // Extract potential lead information from message
            const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            const phoneMatch = message.match(/(\+\d{1,3}[-.]?)?\d{3}[-.]?\d{3}[-.]?\d{4}/);
            const nameMatch = message.match(/my name is ([a-zA-Z\s]+)/i);
    
            const leadInfo = {
                email: emailMatch ? emailMatch[0] : null,
                phone: phoneMatch ? phoneMatch[0] : null,
                name: nameMatch ? nameMatch[1] : null,
                message: message,
                domain: window.location.host,
                timestamp: new Date().toISOString(),
                previousMessages: conversationHistory, // Add conversation history
                leadId: currentLeadId // Add the current leadId if it exists
            };
    
            const response = await fetch(`${window.chatbotConfig.domain}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.chatbotConfig.sessionToken}`
                },
                body: JSON.stringify({ 
                    message,
                    leadInfo,
                    metadata: {
                        url: window.location.href,
                        referrer: document.referrer,
                        userAgent: navigator.userAgent
                    }
                }),
                mode: 'cors'
            });
    
            console.log('Chat response:', response);
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Chat data:', data);
            removeLoadingIndicator();
            
            if (data.error) {
                throw new Error(data.error);
            } else {
                // Store the leadId if it's returned from the API
                if (data.leadId) {
                    currentLeadId = data.leadId;
                }
                
                addMessage(data.response);
                
                // Update conversation history with leadId
                conversationHistory.push(
                    { role: "user", content: message, leadId: currentLeadId },
                    { role: "assistant", content: data.response, leadId: currentLeadId }
                );
                
                // Optional: Limit history to last N messages
                if (conversationHistory.length > 10) {
                    conversationHistory = conversationHistory.slice(-10);
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            removeLoadingIndicator();
            addMessage('Sorry, I\'m having trouble connecting right now. Please try again.');
        }
    
        isWaitingForResponse = false;
        input.disabled = false;
        sendButton.disabled = false;
        input.focus();
    }

    // Initialize widget first
initializeWidget().then(() => {
    // Widget initialization complete
}).catch(error => {
    console.error('Widget initialization failed:', error);
});

    // Then set up event listeners
    sendButton.addEventListener('click', () => {
        const message = input.value.trim();
        if (message) {
            sendMessage(message);
            input.value = '';
        }
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const message = input.value.trim();
            if (message) {
                sendMessage(message);
                input.value = '';
            }
        }
    });

})();