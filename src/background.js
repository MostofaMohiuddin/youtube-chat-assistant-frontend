// Listen for extension installation event
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Check if API key is already set (unlikely for new install, but good practice)
    chrome.storage.local.get(["llmApiKey"], function (result) {
      if (!result.llmApiKey) {
        // Open the popup page in a new tab
        chrome.tabs.create({
          url: "popup.html",
        });
      }
    });
  }
});
