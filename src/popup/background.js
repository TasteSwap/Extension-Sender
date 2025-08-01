const QLOO_API_KEY = 'xxxxxxxxxxxxxx'; // Replace with your actual API key

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "fetchQlooEntity") {
    fetch("https://hackathon.api.qloo.com/v2/insights?signal.interests.tags=urn:tag:genre:brand:fashion:footwear:sneakers&filter.type=urn:entity:brand", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": QLOO_API_KEY
      },
    })
      .then((res) => res.json())
      .then((data) => sendResponse({ success: true, data }))
      .catch((error) => sendResponse({ success: false, error: error.message }));

    // Keep message channel open
    return true;
  }
});
