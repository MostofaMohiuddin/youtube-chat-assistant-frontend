// Wait for YouTube page to load
function waitForYouTubePlayer() {
  return new Promise((resolve) => {
    const checkPlayer = () => {
      const player = document.querySelector(
        "#movie_player, .html5-video-player"
      );
      if (player) {
        resolve(player);
      } else {
        setTimeout(checkPlayer, 500);
      }
    };
    checkPlayer();
  });
}

// Create chat button
function createChatButton() {
  const button = document.createElement("button");
  button.id = "youtube-chat-btn";
  button.innerHTML = "💬 Chat";
  button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: #ff0000;
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    `;

  button.addEventListener("mouseenter", () => {
    button.style.background = "#cc0000";
    button.style.transform = "scale(1.05)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.background = "#ff0000";
    button.style.transform = "scale(1)";
  });

  return button;
}

// Create chatbox
function createChatbox() {
  const chatbox = document.createElement("div");
  chatbox.id = "youtube-chatbox";
  chatbox.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10001;
      display: none;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

  chatbox.innerHTML = `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
        background: #f8f9fa;
        border-radius: 10px 10px 0 0;
      ">
        <h3 style="margin: 0; color: #333; font-size: 16px;">Chat Assistant</h3>
        <button id="close-chat" style="
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">×</button>
      </div>
      
      <div id="chat-messages" style="
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
      ">
        <div class="message bot-message">
          <div style="background: #f0f2f5; padding: 10px 15px; border-radius: 18px; max-width: 80%;">
            Hello! I'm here to help you with this YouTube video. What would you like to know?
          </div>
        </div>
      </div>
      
      <div style="
        padding: 15px 20px;
        border-top: 1px solid #eee;
        display: flex;
        gap: 10px;
      ">
        <input
          type="text"
          id="chat-input"
          placeholder="Type your message..."
          style="
            flex: 1;
            padding: 10px 15px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
            font-size: 14px;
          "
        />
        <button id="send-message" style="
          background: #ff0000;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
        ">Send</button>
      </div>
    `;

  return chatbox;
}

// Add message to chat
function addMessage(content, isBot = false) {
  const messagesContainer = document.getElementById("chat-messages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isBot ? "bot-message" : "user-message"}`;

  const alignment = isBot ? "flex-start" : "flex-end";
  const bgColor = isBot ? "#f0f2f5" : "#ff0000";
  const textColor = isBot ? "#333" : "white";

  messageDiv.style.cssText = `
      display: flex;
      justify-content: ${alignment};
      margin-bottom: 10px;
    `;

  messageDiv.innerHTML = `
      <div style="
        background: ${bgColor};
        color: ${textColor};
        padding: 10px 15px;
        border-radius: 18px;
        max-width: 80%;
        word-wrap: break-word;
      ">
        ${content}
      </div>
    `;

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message to backend
async function sendMessageToBackend(message) {
  try {
    // Get current video information
    const videoTitle =
      document
        .querySelector("h1.ytd-video-primary-info-renderer")
        ?.textContent?.trim() || "";
    const videoUrl = window.location.href;
    const channelName =
      document.querySelector("ytd-channel-name a")?.textContent?.trim() || "";

    const response = await fetch("https://your-backend-server.com/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        context: {
          videoTitle: videoTitle,
          videoUrl: videoUrl,
          channelName: channelName,
          timestamp: Date.now(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response || "Sorry, I could not process your request.";
  } catch (error) {
    console.error("Error sending message:", error);
    return "Sorry, there was an error connecting to the server. Please try again.";
  }
}

// Initialize extension
async function initExtension() {
  await waitForYouTubePlayer();

  // Create and add button
  const chatButton = createChatButton();
  document.body.appendChild(chatButton);

  // Create and add chatbox
  const chatbox = createChatbox();
  document.body.appendChild(chatbox);

  // Button click handler
  chatButton.addEventListener("click", () => {
    const isVisible = chatbox.style.display === "flex";
    chatbox.style.display = isVisible ? "none" : "flex";
  });

  // Close button handler
  document.getElementById("close-chat").addEventListener("click", () => {
    chatbox.style.display = "none";
  });

  // Send message handlers
  const sendMessage = async () => {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    addMessage(message, false);
    input.value = "";

    // Add loading message
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "loading-message";
    loadingDiv.className = "message bot-message";
    loadingDiv.style.cssText =
      "display: flex; justify-content: flex-start; margin-bottom: 10px;";
    loadingDiv.innerHTML = `
        <div style="
          background: #f0f2f5;
          color: #333;
          padding: 10px 15px;
          border-radius: 18px;
          max-width: 80%;
        ">
          <span style="animation: pulse 1.5s infinite;">Thinking...</span>
        </div>
      `;
    document.getElementById("chat-messages").appendChild(loadingDiv);
    document.getElementById("chat-messages").scrollTop =
      document.getElementById("chat-messages").scrollHeight;

    // Send to backend
    const response = await sendMessageToBackend(message);

    // Remove loading message
    const loading = document.getElementById("loading-message");
    if (loading) loading.remove();

    // Add bot response
    addMessage(response, true);
  };

  document
    .getElementById("send-message")
    .addEventListener("click", sendMessage);
  document.getElementById("chat-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
}

// Handle YouTube's dynamic navigation
let currentUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    if (location.href.includes("/watch")) {
      // Remove existing elements
      const existingButton = document.getElementById("youtube-chat-btn");
      const existingChatbox = document.getElementById("youtube-chatbox");
      if (existingButton) existingButton.remove();
      if (existingChatbox) existingChatbox.remove();

      // Reinitialize
      setTimeout(initExtension, 1000);
    }
  }
});

observer.observe(document, { subtree: true, childList: true });

// Initial load
if (location.href.includes("/watch")) {
  initExtension();
}
