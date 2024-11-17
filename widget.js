// widget.js
(function () {
    const config = window.CHAT_CONFIG || {};
    const API_URL = config.apiUrl || 'http://localhost:8000';

    const styles = `
        .ai-chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .chat-button {
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background: #2196F3;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .chat-container {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 320px;
        height: 450px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 5px 40px rgba(0,0,0,0.16);
        display: none;
        flex-direction: column;
        overflow: hidden;
        box-sizing: border-box;
    }

        .chat-header {
            background: #2196F3;
            color: white;
            padding: 16px 20px;
            font-size: 18px;
            font-weight: 400;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }

        .close-button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 24px;
            padding: 0;
            line-height: 1;
            font-weight: normal;
        }

        .chat-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            background: #fff;
        }

        .message {
            padding: 12px 16px;
            border-radius: 12px;
            max-width: 85%;
            margin-bottom: 8px;
            font-size: 15px;
            line-height: 1.4;
        }

        .ai-message {
            background: #f8f9fa;
            color: #333;
            margin-right: auto;
            border-bottom-left-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .user-message {
            background: #2196F3;
            color: white;
            margin-left: auto;
            border-bottom-right-radius: 4px;
        }

        .chat-footer {
                padding: 12px 16px;
                background: white;
                border-top: 1px solid rgba(0,0,0,0.08);
                width: 100%;
                box-sizing: border-box;
                position: relative;
                bottom: 0;
            }

            .chat-input-box {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #2196F3;
                border-radius: 24px;
                outline: none;
                font-size: 14px;
                background: white;
                box-sizing: border-box;
                margin: 0;
            }

        .chat-input-box::placeholder {
            color: #999;
        }

        .loading {
            padding: 8px 16px;
            color: #666;
            font-size: 14px;
            display: none;
        }
    `;

    const widgetHTML = `
        <div class="ai-chat-widget">
            <button class="chat-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                </svg>
            </button>
            <div class="chat-container">
                <div class="chat-header">
                    <span>Chat Assistant</span>
                    <button class="close-button">X</button>
                </div>
                <div class="chat-body">
                    <div class="message ai-message">
                        Hello! How can I help you today?
                    </div>
                </div>
                <div class="loading">AI is thinking...</div>
                <div class="chat-footer">
                    <input type="text" class="chat-input-box" 
                           placeholder="Type your message...">
                </div>
            </div>
        </div>
    `;

    // Create and inject styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Add widget HTML to page
    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Widget functionality
    const chatButton = document.querySelector('.chat-button');
    const closeButton = document.querySelector('.close-button');
    const chatContainer = document.querySelector('.chat-container');
    const inputBox = document.querySelector('.chat-input-box');
    const messagesContainer = document.querySelector('.chat-body');
    const loadingIndicator = document.querySelector('.loading');

    function toggleChat() {
        chatContainer.style.display =
            chatContainer.style.display === 'none' ? 'flex' : 'none';
    }

    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function sendMessage() {
        const message = inputBox.value.trim();
        if (!message) return;

        addMessage(message, true);
        inputBox.value = '';
        loadingIndicator.style.display = 'block';

        try {
            const response = await fetch(`${API_URL}/api/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: message })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            addMessage(data.result, false);
        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, I encountered an error. Please try again.', false);
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    // Bind events
    chatButton.addEventListener('click', toggleChat);
    closeButton.addEventListener('click', toggleChat);
    inputBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
})();