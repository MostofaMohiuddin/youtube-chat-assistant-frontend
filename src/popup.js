// Get DOM elements
const apiKeyInput = document.getElementById("api-key");
const saveBtn = document.getElementById("save-btn");
const toggleBtn = document.getElementById("toggle-btn");
const deleteBtn = document.getElementById("delete-btn");
const statusEl = document.getElementById("status");
const showIcon = document.querySelector(".eye-icon.show");
const hideIcon = document.querySelector(".eye-icon.hide");

// Load existing API key if available
loadApiKey();

function loadApiKey() {
  chrome.storage.local.get(["llmApiKey"], function (result) {
    if (result.llmApiKey) {
      apiKeyInput.value = result.llmApiKey;
      deleteBtn.disabled = false;
    } else {
      deleteBtn.disabled = true;
    }
  });
}

// Toggle API key visibility
toggleBtn.addEventListener(
  "click",
  function () {
    if (apiKeyInput.type === "password") {
      apiKeyInput.type = "text";
      showIcon.style.display = "none";
      hideIcon.style.display = "block";
    } else {
      apiKeyInput.type = "password";
      showIcon.style.display = "block";
      hideIcon.style.display = "none";
    }
  },
  { once: false }
);

// Save API key to storage
saveBtn.addEventListener("click", function () {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showStatus("Please enter a valid API key", "error");
    return;
  }

  // Provide visual feedback during save
  saveBtn.textContent = "Saving...";
  saveBtn.disabled = true;
  saveBtn.classList.add("saving");

  chrome.storage.local.set({ llmApiKey: apiKey }, function () {
    showStatus("API key saved successfully!", "success");
    deleteBtn.disabled = false;

    // Restore button state after saving
    setTimeout(() => {
      saveBtn.textContent = "Save API Key";
      saveBtn.disabled = false;
      saveBtn.classList.remove("saving");
    }, 1000);
  });
});

// Delete API key
deleteBtn.addEventListener("click", function () {
  deleteBtn.textContent = "Deleting...";
  deleteBtn.disabled = true;

  chrome.storage.local.remove("llmApiKey", function () {
    apiKeyInput.value = "";
    showStatus("API key deleted successfully", "success");
    deleteBtn.textContent = "Delete";
    deleteBtn.disabled = true;
  });
});

// Enhanced status message function
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = `status ${type} visible`;

  // Add animation for better visibility
  statusEl.style.animation = "pulse 0.3s ease-in-out";

  setTimeout(function () {
    statusEl.style.animation = "";
    // Keep the message visible longer for better user experience
    setTimeout(function () {
      statusEl.className = `status ${type}`;
    }, 3000);
  }, 300);
}

// Allow saving with Enter key when input is focused
apiKeyInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    saveBtn.click();
  }
});
