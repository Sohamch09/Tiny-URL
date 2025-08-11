function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
}

window.onload = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
  loadHistory();
};

async function shortenURL() {
  const longUrl = document.getElementById("longUrl").value.trim();
  const shortUrlDiv = document.getElementById("shortUrl");
  const errorMsg = document.getElementById("errorMsg");
  const copyBtn = document.getElementById("copyBtn");
  const qrCodeDiv = document.getElementById("qrCode");

  shortUrlDiv.innerHTML = '';
  errorMsg.innerHTML = '';
  qrCodeDiv.innerHTML = '';
  copyBtn.style.display = 'none';
  shortUrlDiv.classList.remove("show");
  errorMsg.classList.remove("show");

  if (!longUrl) {
    errorMsg.textContent = "🚫 Please enter a valid URL!";
    errorMsg.classList.add("show");
    return;
  }

  try {
    const response = await fetch("https://api.tinyurl.com/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer your_api_key_here" // Replace with your TinyURL API key
      },
      body: JSON.stringify({
        url: longUrl,
        domain: "tinyurl.com"
      })
    });

    const data = await response.json();

    if (data.data && data.data.tiny_url) {
      const shortURL = data.data.tiny_url;

      shortUrlDiv.innerHTML = `✅ Shortened URL: <a href="${shortURL}" target="_blank" id="shortLink">${shortURL}</a>`;
      shortUrlDiv.classList.add("show");
      copyBtn.style.display = 'inline-block';

      // ✅ Working QR Code
      const encodedURL = encodeURIComponent(shortURL);
      qrCodeDiv.innerHTML = `<img src="https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=${encodedURL}" alt="QR Code" />`;

      saveToHistory(shortURL);
      loadHistory();

    } else {
      errorMsg.textContent = "❌ Failed to shorten URL. Check input or API key.";
      errorMsg.classList.add("show");
    }

  } catch (error) {
    console.error("Error:", error);
    errorMsg.textContent = "⚠️ Something went wrong. Try again later.";
    errorMsg.classList.add("show");
  }
}

function copyToClipboard() {
  const link = document.getElementById("shortLink").textContent;
  navigator.clipboard.writeText(link).then(() => {
    alert("✅ Link copied to clipboard!");
  }).catch(() => {
    alert("❌ Failed to copy!");
  });
}

function saveToHistory(url) {
  let history = JSON.parse(localStorage.getItem("shortUrls")) || [];
  if (!history.includes(url)) {
    history.unshift(url);
    if (history.length > 10) history.pop();
    localStorage.setItem("shortUrls", JSON.stringify(history));
  }
}

function loadHistory() {
  const historyList = document.getElementById("historyList");
  const history = JSON.parse(localStorage.getItem("shortUrls")) || [];

  historyList.innerHTML = "";
  history.forEach((url) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${url}" target="_blank">${url}</a>`;
    historyList.appendChild(li);
  });
}
