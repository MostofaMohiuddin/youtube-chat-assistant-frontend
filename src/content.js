const CHAT_MESSAGES = [];
const API_URL = "https://yt-assistant.mostofa.site/api";
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

  // Modern chat bubble icon with typing dots
  button.innerHTML = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z" 
          stroke="white" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="8" cy="12" r="1.5" fill="white"/>
        <circle cx="12" cy="12" r="1.5" fill="white"/>
        <circle cx="16" cy="12" r="1.5" fill="white"/>
      </svg>
    </div>
    <span style="margin-left: 8px;">Ask Video Assistant</span>
  `;

  button.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 24px;
    z-index: 10000;
    background: linear-gradient(135deg, #FF3636 0%, #C90000 100%);
    color: white;
    border: none;
    padding: 12px 18px;
    border-radius: 28px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 20px rgba(255,0,0,0.2), 0 2px 8px rgba(0,0,0,0.15);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    align-items: center;
    gap: 6px;
    letter-spacing: 0.2px;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  `;

  // Create a compact version for smaller screens
  const mediaQuery = window.matchMedia("(max-width: 768px)");
  const updateButtonSize = (isMobile) => {
    if (isMobile) {
      button.style.padding = "14px";
      button.style.borderRadius = "50%";
      button.querySelector("span").style.display = "none";
    } else {
      button.style.padding = "12px 18px";
      button.style.borderRadius = "28px";
      button.querySelector("span").style.display = "inline";
    }
  };

  updateButtonSize(mediaQuery.matches);
  mediaQuery.addEventListener("change", (e) => updateButtonSize(e.matches));

  button.addEventListener("mouseenter", () => {
    button.style.background =
      "linear-gradient(135deg, #E62E2E 0%, #B00000 100%)";
    button.style.transform = "translateY(-4px) scale(1.03)";
    button.style.boxShadow =
      "0 8px 24px rgba(255,0,0,0.25), 0 4px 12px rgba(0,0,0,0.2)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.background =
      "linear-gradient(135deg, #FF3636 0%, #C90000 100%)";
    button.style.transform = "translateY(0) scale(1)";
    button.style.boxShadow =
      "0 4px 20px rgba(255,0,0,0.2), 0 2px 8px rgba(0,0,0,0.15)";
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
      width: 380px;
      height: 540px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.25);
      z-index: 10001;
      display: none;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: default;
    `;

  // Add CSS for animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    .message {
      animation: fadeIn 0.3s ease forwards;
    }
    .bot-message-bubble {
      background: #f0f2f5;
      color: #333;
      border-radius: 18px 18px 18px 4px;
      font-size: 14px;
      line-height: 1.5;
      letter-spacing: 0.01em;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .user-message-bubble {
      background: linear-gradient(135deg, #ff0000, #cc0000);
      color: white;
      border-radius: 18px 18px 4px 18px;
      font-size: 14px;
      line-height: 1.5;
      letter-spacing: 0.01em;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #youtube-chatbox-header {
      cursor: move; /* Show move cursor on header */
      user-select: none; /* Prevent text selection during drag */
    }
    #chat-messages p {
      margin: 0;
      padding: 0;
    }
    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      background-color: rgba(0, 0, 0, 0.05);
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 14px;
    }
    ul, ol {
      padding-left: 1.5em;
      margin: 0.5em 0;
    }
    li {
      margin-bottom: 0.3em;
    }
  `;
  document.head.appendChild(style);

  chatbox.innerHTML = `
      <div id="youtube-chatbox-header" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #eee;
        background: #ffffff;
        border-radius: 16px 16px 0 0;
      ">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff0000">
            <path d="M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z"/>
          </svg>
          <h3 style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">Video Assistant</h3>
        </div>
        <button id="close-chat" style="
          background: #f5f5f5;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        ">×</button>
      </div>
      
      <div id="chat-messages" style="
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
        background-color: #fafafa;
        scroll-behavior: smooth;
      ">
        <div class="message bot-message">
          <div class="bot-message-bubble" style="padding: 12px 16px; max-width: 80%; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
            <p style="margin: 0;">Hello! I'm here to help you with this YouTube video. What would you like to know?</p>
          </div>
        </div>
      </div>
      
      <div style="
        padding: 16px 20px;
        border-top: 1px solid #eee;
        display: flex;
        gap: 12px;
        background-color: white;
        align-items: center;
      ">
        <input
          type="text"
          id="chat-input"
          placeholder="Type your question about this video..."
          style="
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #e0e0e0;
            border-radius: 24px;
            outline: none;
            font-size: 14px;
            transition: all 0.2s ease;
            background-color: #f9f9f9;
          "
        />
        <button id="send-message" style="
          background: #ff0000;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(255,0,0,0.3);
          transition: all 0.2s ease;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
          </svg>
        </button>
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
  const bubbleClass = isBot ? "bot-message-bubble" : "user-message-bubble";

  messageDiv.style.cssText = `
      display: flex;
      justify-content: ${alignment};
      margin-bottom: 10px;
    `;

  // Format content with basic markdown-like syntax
  if (isBot) {
    // Format bullet points
    content = content.replace(/- (.+?)(\n|$)/g, "<li>$1</li>");

    // Wrap bullet points in unordered list
    if (content.includes("<li>")) {
      content = content.replace(/<li>(.+?)<\/li>/g, "<ul><li>$1</li></ul>");
      content = content.replace(/<\/ul>\s*<ul>/g, "");
    }

    // Format numbered lists
    content = content.replace(/(\d+)\. (.+?)(\n|$)/g, "<li>$2</li>");

    // Wrap numbered lists in ordered list
    if (content.includes("<li>") && !content.includes("<ul>")) {
      content = content.replace(/<li>(.+?)<\/li>/g, "<ol><li>$1</li></ol>");
      content = content.replace(/<\/ol>\s*<ol>/g, "");
    }

    // Add paragraph breaks for empty lines
    content = content.replace(/\n\s*\n/g, "</p><p>");

    // Format code blocks with monospace font
    content = content.replace(/`(.+?)`/g, "<code>$1</code>");

    // Ensure content is wrapped in paragraphs
    if (!content.startsWith("<")) {
      content = `<p>${content}</p>`;
    }
  }

  messageDiv.innerHTML = `
      <div class="${bubbleClass}" style="
        padding: 12px 16px;
        max-width: 80%;
        word-wrap: break-word;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      ">
        ${isBot ? content : `<p>${content}</p>`}
      </div>
    `;

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  CHAT_MESSAGES.push({
    content: content,
    role: isBot ? "assistant" : "user",
  });
}

// Send message to backend
async function sendMessageToBackend() {
  try {
    const llmApiKey = await new Promise((resolve) => {
      chrome.storage.local.get(["llmApiKey"], function (result) {
        resolve(result.llmApiKey || "");
      });
    });
    // Get current video information
    const videoTitle =
      document
        .querySelector("h1.ytd-video-primary-info-renderer")
        ?.textContent?.trim() || "";
    const videoUrl = window.location.href;
    const channelName =
      document.querySelector("ytd-channel-name a")?.textContent?.trim() || "";

    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        messages: CHAT_MESSAGES,
        api_key: llmApiKey,
        context: {
          videoTitle: videoTitle,
          videoUrl: videoUrl,
          videoId: new URL(videoUrl).searchParams.get("v"),
          channelName: channelName,
          timestamp: Date.now(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.message || "Sorry, I could not process your request.";
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

  // Make chatbox draggable
  makeChatboxDraggable(chatbox);

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
    const llmApiKey = await new Promise((resolve) => {
      chrome.storage.local.get(["llmApiKey"], function (result) {
        resolve(result.llmApiKey || "");
      });
    });
    if (!llmApiKey) {
      alert("Please set your API key in the extension settings.");
      return;
    }

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
        <div class="bot-message-bubble" style="
          padding: 12px 16px;
          max-width: 80%;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        ">
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #ff0000; animation: pulse 1s infinite alternate;"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #ff0000; animation: pulse 1s infinite alternate 0.2s;"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #ff0000; animation: pulse 1s infinite alternate 0.4s;"></div>
          </div>
        </div>
      `;
    document.getElementById("chat-messages").appendChild(loadingDiv);
    document.getElementById("chat-messages").scrollTop =
      document.getElementById("chat-messages").scrollHeight;

    // Send to backend
    const response = await sendMessageToBackend();

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

// Add this new function for draggable functionality
function makeChatboxDraggable(chatbox) {
  const header = document.getElementById("youtube-chatbox-header");
  let isDragging = false;
  let initialX, initialY, currentX, currentY;
  let offsetX = 0,
    offsetY = 0;

  header.addEventListener("mousedown", startDrag);

  function startDrag(e) {
    e.preventDefault();

    // Get initial position of cursor
    initialX = e.clientX;
    initialY = e.clientY;

    // Get current position of chatbox
    const rect = chatbox.getBoundingClientRect();
    offsetX = initialX - rect.left;
    offsetY = initialY - rect.top;

    isDragging = true;

    // Add event listeners for dragging
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
  }

  function drag(e) {
    if (!isDragging) return;

    e.preventDefault();

    // Calculate new position
    currentX = e.clientX - offsetX;
    currentY = e.clientY - offsetY;

    // Apply boundary constraints
    const maxX = window.innerWidth - chatbox.offsetWidth;
    const maxY = window.innerHeight - chatbox.offsetHeight;

    currentX = Math.min(Math.max(0, currentX), maxX);
    currentY = Math.min(Math.max(0, currentY), maxY);

    // Update position
    chatbox.style.left = currentX + "px";
    chatbox.style.top = currentY + "px";
    chatbox.style.right = "auto";
  }

  function stopDrag() {
    isDragging = false;
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);
  }
}

// Handle YouTube's dynamic navigation
let currentUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;

    // Remove existing elements on any navigation
    const existingButton = document.getElementById("youtube-chat-btn");
    const existingChatbox = document.getElementById("youtube-chatbox");
    if (existingButton) existingButton.remove();
    if (existingChatbox) existingChatbox.remove();

    // Only re-initialize if on a /watch page
    if (location.href.includes("/watch")) {
      setTimeout(initExtension, 1000);
    }
  }
});

observer.observe(document, { subtree: true, childList: true });

// Initial load
if (location.href.includes("/watch")) {
  initExtension();
}
