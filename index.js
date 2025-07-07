//@ts-check

let weatherDescription = "fabulous weather";
let weatherTomorrow = "unbekannt";
let city = "deiner Stadt";
let weatherLoaded = false;
window.emojiHistory = [];

// Wetter und Standort holen (heute & morgen)
async function fetchWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const apiKey = 'fbea38c1e1c2860011cec9510cd73769';
      // Heute
      const urlToday = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=de`;
      // Morgen (Forecast)
      const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=de`;
      try {
        const resToday = await fetch(urlToday);
        const dataToday = await resToday.json();
        weatherDescription = dataToday.weather[0].description;
        city = dataToday.name;

        const resForecast = await fetch(urlForecast);
        const dataForecast = await resForecast.json();
        // Nimm das Wetter für ca. 24h später (8*3h = 24h)
        if (dataForecast && dataForecast.list && dataForecast.list[8]) {
          weatherTomorrow = dataForecast.list[8].weather[0].description;
        } else {
          weatherTomorrow = "unbekannt";
        }
        weatherLoaded = true;
      } catch (e) {
        weatherDescription = "fabulous weather";
        weatherTomorrow = "unbekannt";
        city = "deiner Stadt";
        weatherLoaded = true;
      }
    }, () => { weatherLoaded = true; });
  } else {
    weatherLoaded = true;
  }
}
fetchWeather();

// Prompt-Generator für Emoji, Wetter heute & Uhrzeit als Zeichen, Dragqueen-Stil
function getOrakelPrompt(emoji, bedeutung) {
  const now = new Date();
  const hour = now.getHours();

  let wetterHinweis = "";
  if (weatherDescription.includes("regen")) wetterHinweis = "Es regnet.";
  if (weatherDescription.includes("sonn")) wetterHinweis = "Die Sonne knallt, Honey!";
  if (weatherDescription.includes("wolk") || weatherDescription.includes("cloud")) wetterHinweis = "Wolken ziehen auf, Girl!";
  if (weatherDescription.includes("schnee")) wetterHinweis = "Es schneit – Zeit für Glitzer!";

  // Mehr Dragqueen-Tageszeit-Varianten
  let tageszeitHinweis = "";
  if (hour < 6) {
    const nacht = [
      "in der tiefen Drag-Nacht",
      "wenn nur Nachteulen und Queens wach sind",
      "zur Stunde der Schatten und Geheimnisse",
      "wenn die Discokugel noch leise dreht"
    ];
    tageszeitHinweis = nacht[Math.floor(Math.random() * nacht.length)];
  } else if (hour < 12) {
    const morgen = [
      "am funkelnden Morgen, frisch gepudert",
      "in der Morgendämmerung voller Hoffnung",
      "wenn die Sonne dich wachküsst, Queen",
      "beim ersten Kaffee mit extra Glitzer"
    ];
    tageszeitHinweis = morgen[Math.floor(Math.random() * morgen.length)];
  } else if (hour < 18) {
    const nachmittag = [
      "am glitzernden Nachmittag, Babe",
      "wenn die Sonne hoch am Himmel tanzt",
      "zur Tea-Time mit Drama",
      "im Rampenlicht des Tages"
    ];
    tageszeitHinweis = nachmittag[Math.floor(Math.random() * nachmittag.length)];
  } else if (hour < 22) {
    const abend = [
      "in der goldenen Abendstunde, Queen",
      "wenn die Lichter angehen und das Drama beginnt",
      "zur Happy Hour der Herzen",
      "wenn die Schatten länger und die Lippenstifte dunkler werden"
    ];
    tageszeitHinweis = abend[Math.floor(Math.random() * abend.length)];
  } else {
    const nacht2 = [
      "wenn die Nacht ruft und die Lichter funkeln",
      "zur Aftershow-Party der Gefühle",
      "im geheimnisvollen Schein der Discokugel",
      "wenn nur noch die echten Queens unterwegs sind"
    ];
    tageszeitHinweis = nacht2[Math.floor(Math.random() * nacht2.length)];
  }

  return `
Du bist eine extravagante, humorvolle Dragqueen. Erfinde eine magische, kurze Prophezeiung (max. 18 Wörter) für die Nutzerin, die sich auf das Emoji "${emoji}" und seine Bedeutung "${bedeutung}" bezieht. Die Bedeutung soll klar im Text vorkommen (z.B. bei "Verrat oder Gossip" eine Warnung vor falschen Personen). Wetter ("${weatherDescription}", ${wetterHinweis}) und die Tageszeit (${tageszeitHinweis}) sollen subtil und geheimnisvoll einfließen. Sprich im Dragqueen-Stil (Slang, Humor, Anrede wie Honey, Girl, Queen, etc.), aber KEINE Emojis im Text.
`.trim();
}

document.addEventListener('DOMContentLoaded', () => {
  const emojiBar = document.getElementById('emoji-bar');
  const historyDiv = document.getElementById('chosen-emojis-bar');
  let tooltipDiv = null;

  function updateHistory() {
    historyDiv.textContent = window.emojiHistory.join(' ');
  }

  async function showProphecy(emoji, bedeutung) {
    if (!weatherLoaded) {
      alert("Wetterdaten werden noch geladen. Bitte kurz warten!");
      return;
    }

    // Lade-Status anzeigen
    let card = document.querySelector('.oracle-card');
    if (card) card.remove();
    card = document.createElement('div');
    card.className = 'oracle-card';
    card.textContent = 'Das Orakel liest die Zeichen...';
    document.body.appendChild(card);

    // Prompt bauen
    const prompt = getOrakelPrompt(emoji, bedeutung);

    // Val Town API-Aufruf
    const apiEndpoint = 'https://annaaa--ec4d4e002f7a4c5ebd5267c134352040.web.val.run';
    const messageHistory = {
      messages: [
        { role: 'system', content: 'Du bist eine Dragqueen.' },
        { role: 'user', content: prompt }
      ]
    };

    let prophecy = '';
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(messageHistory)
      });
      if (!response.ok) {
        prophecy = 'Die Zeichen sind heute schwer zu deuten, Liebling!';
      } else {
        const data = await response.json();
        prophecy = data.completion?.choices?.[0]?.message?.content || 'Die Zeichen sind heute schwer zu deuten, Liebling!';
      }
    } catch (e) {
      prophecy = 'Die Zeichen sind heute schwer zu deuten, Liebling!';
    }

    card.textContent = prophecy;

    // "Noch eine Vision"-Button
    let refreshBtn = document.createElement('button');
    refreshBtn.textContent = "Noch eine Vision, Darling? 🔮";
    refreshBtn.style.marginTop = "1.5rem";
    refreshBtn.style.background = "#ff69b4";
    refreshBtn.style.color = "#fff";
    refreshBtn.style.border = "none";
    refreshBtn.style.borderRadius = "1.2rem";
    refreshBtn.style.padding = "0.7rem 1.5rem";
    refreshBtn.style.fontSize = "1.1rem";
    refreshBtn.style.cursor = "pointer";
    refreshBtn.style.fontFamily = "inherit";
    refreshBtn.style.boxShadow = "0 0 1rem #fff5";
    refreshBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Prophezeiungsfeld entfernen, Emoji-Auswahl wieder möglich
      card.remove();
    });
    card.appendChild(document.createElement('br'));
    card.appendChild(refreshBtn);

    card.addEventListener('click', () => card.remove());
    setTimeout(() => {
      card.style.opacity = '0';
      setTimeout(() => card.remove(), 700);
    }, 20000);
  }

  if (emojiBar) {
    emojiBar.querySelectorAll('.emoji-btn').forEach(btn => {
      // Custom Tooltip für Emoji-Bedeutung
      btn.addEventListener('mouseenter', (e) => {
        const title = btn.getAttribute('title');
        if (!title) return;
        // Entferne title, damit kein Standard-Tooltip erscheint
        btn.setAttribute('data-old-title', title);
        btn.removeAttribute('title');
        tooltipDiv = document.createElement('div');
        tooltipDiv.className = 'emoji-tooltip';
        tooltipDiv.textContent = title;
        document.body.appendChild(tooltipDiv);
        const rect = btn.getBoundingClientRect();
        tooltipDiv.style.left = `${rect.left + rect.width/2 - tooltipDiv.offsetWidth/2}px`;
        tooltipDiv.style.top = `${rect.top - 40}px`;
      });
      btn.addEventListener('mousemove', (e) => {
        if (tooltipDiv) {
          tooltipDiv.style.left = `${e.clientX + 10}px`;
          tooltipDiv.style.top = `${e.clientY - 40}px`;
        }
      });
      btn.addEventListener('mouseleave', () => {
        if (tooltipDiv) {
          tooltipDiv.remove();
          tooltipDiv = null;
        }
        // title wiederherstellen
        const oldTitle = btn.getAttribute('data-old-title');
        if (oldTitle) {
          btn.setAttribute('title', oldTitle);
          btn.removeAttribute('data-old-title');
        }
      });

      // Emoji-Click
      btn.addEventListener('click', () => {
        const emoji = btn.textContent;
        const bedeutung = btn.getAttribute('data-old-title') || btn.getAttribute('title') || '';
        window.emojiHistory.push(emoji);
        updateHistory();
        showProphecy(emoji, bedeutung);
      });
    });
  }

  // Initial leeren
  if (historyDiv) historyDiv.textContent = '';
});

// Glitzer-Effekt hinter der Maus
document.addEventListener('mousemove', (event) => {
  const shapesCount = 2;
  for (let i = 0; i < shapesCount; i++) {
    const shape = document.createElement('div');
    const shapeType = Math.random();
    let borderRadius = '0%';
    if (shapeType < 0.33) borderRadius = '50%';
    else if (shapeType < 0.66) borderRadius = '30%';
    const color1 = `hsl(${Math.random()*360}, 90%, 60%)`;
    const color2 = `hsl(${Math.random()*360}, 90%, 70%)`;
    const size = Math.random() * 1.2 + 0.7;
    shape.setAttribute('style', `
      position: fixed;
      left: ${event.clientX + Math.random()*14 - 7}px;
      top: ${event.clientY + Math.random()*14 - 7}px;
      width: ${size}rem;
      height: ${size * (Math.random() * 0.7 + 0.7)}rem;
      background: linear-gradient(${Math.random()*360}deg, ${color1}, ${color2});
      opacity: ${Math.random() * 0.4 + 0.4};
      border-radius: ${borderRadius};
      box-shadow: 0 0 ${Math.random()*1.2+0.5}rem ${color1};
      mix-blend-mode: screen;
      transform: rotate(${Math.random()*360}deg) scale(${Math.random()*0.9+0.7});
      transition: all 1.2s cubic-bezier(.68,-0.55,.27,1.55);
      z-index: 9999;
      pointer-events: none;
    `);
    document.body.appendChild(shape);

    setTimeout(() => {
      shape.style.opacity = '0';
      shape.style.transform += ' scale(1.5) rotate(20deg)';
      setTimeout(() => shape.remove(), 700);
    }, 80 + Math.random()*100);
  }
});