if (typeof browser === "undefined") {
  var browser = chrome;
}

document.getElementById("clickMe").addEventListener("click", async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  browser.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => alert("Hello from your cross-browser extension!")
  });
});
