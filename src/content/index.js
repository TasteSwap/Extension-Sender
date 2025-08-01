console.log("✅ TasteSwap content script loaded");

window.addEventListener("load", () => {
  const hostname = window.location.hostname;

  let productTitle, productImage, insertAfterEl;

  if (hostname.includes("amazon")) {
    productTitle = document.getElementById("productTitle")?.innerText?.trim();
    productImage = document.getElementById("landingImage")?.src;
    insertAfterEl = document.getElementById("productTitle");
  } else if (hostname.includes("flipkart")) {
    productTitle = document.querySelector("h1._6EBuvT")?.innerText?.trim(); // Flipkart product title
    productImage = document.querySelector('img._53J4C-')?.src;
    insertAfterEl = document.querySelector("h1._6EBuvT");
  }

  if (!productTitle || !productImage || !insertAfterEl) return;

  if (document.getElementById("tasteSwapBox")) return;

  const swapBox = document.createElement("div");
  swapBox.id = "tasteSwapBox";
  swapBox.innerHTML = `
    <div style="margin-top: 20px; padding: 10px; border: 2px dashed #22c55e; border-radius: 12px; background: #f0fdf4;">
      <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: bold; color: #166534;">♻️ Want to swap this instead of returning?</h4>
      <button id="tasteSwapBtn" style="padding: 6px 12px; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer;">Find a Match</button>
    </div>
  `;

  insertAfterEl.parentElement?.appendChild(swapBox);

  setTimeout(() => {
    const btn = document.getElementById("tasteSwapBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const data = {
        title: productTitle,
        image: productImage,
      };

      console.log("🖱️ Button clicked with data:", data);

      chrome.storage.local.set({ tasteSwapProduct: data }, () => {
        console.log("📦 Product stored in local storage", data);
        chrome.runtime.sendMessage({ type: "open_popup" });
      });
    });

  }, 100);
});
