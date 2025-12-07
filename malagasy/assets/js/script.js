// Load today's date
document.addEventListener("DOMContentLoaded", function () {
  const today = new Date();
  const dateStr = today.toLocaleDateString("fr-FR");
  document.getElementById("todayDate").textContent = dateStr;

  // Load all phrases
  loadPhrases().then((phrases) => {
    window.allPhrases = phrases;
    console.log("Phrases loaded:", phrases.length);

    // Set current language
    let currentLanguage = "francais";
    document
      .getElementById("languageSelect")
      .addEventListener("change", function () {
        currentLanguage = this.value;
      });

    // Search functionality
    let keywordInput = document.getElementById("keywordInput");
    let suggestions = document.getElementById("suggestions");

    keywordInput.addEventListener("input", function () {
      let keyword = this.value.toLowerCase();
      let results = window.allPhrases
        .filter((phrase) =>
          phrase[currentLanguage].toLowerCase().includes(keyword)
        )
        .slice(0, 5); // Limit to 5 suggestions

      suggestions.innerHTML = "";
      results.forEach((phrase) => {
        let div = document.createElement("div");
        div.className = "suggestion-item p-2 border mb-1";
        div.textContent = phrase[currentLanguage];
        div.onclick = function () {
          selectPhrase(phrase);
        };
        suggestions.appendChild(div);
      });
    });

    // Load existing routine
    loadRoutine();
  });
});

// Load all JSON files
async function loadPhrases() {
  const files = [
    "assets/json/themes/saluer.json",
    "assets/json/themes/banque.json",
    "assets/json/themes/chemin.json",
    "assets/json/themes/expressions.json",
    "assets/json/themes/hotel.json",
    "assets/json/themes/lieux.json",
    "assets/json/themes/loisirs.json",
    "assets/json/themes/magasins.json",
    "assets/json/themes/nourriture.json",
    "assets/json/themes/telephone.json",
    "assets/json/themes/temps.json",
    "assets/json/themes/transport.json",
    "assets/json/themes/transports.json",
    "assets/json/themes/urgence.json",
    "assets/json/themes/ville.json",
    "assets/json/themes/voyage.json",
  ];

  let allPhrases = [];
  for (let file of files) {
    try {
      const response = await fetch(file);
      const data = await response.json();
      allPhrases = allPhrases.concat(data);
    } catch (error) {
      console.error("Error loading", file, error);
    }
  }
  // Dédoublement basé sur la version française
  let uniquePhrases = [];
  let seen = new Set();
  allPhrases.forEach((phrase) => {
    let key = phrase.francais;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePhrases.push(phrase);
    }
  });
  return uniquePhrases;
}

let selectedPhrase = null;

function selectPhrase(phrase) {
  selectedPhrase = phrase;
  document.getElementById("keywordInput").value =
    phrase[document.getElementById("languageSelect").value];
  document.getElementById("suggestions").innerHTML = "";
}

// Add task
document.getElementById("addTaskBtn").addEventListener("click", function () {
  let time = document.getElementById("taskTime").value;
  let lang = document.getElementById("languageSelect").value;

  if (!time || !selectedPhrase) {
    alert("Veuillez sélectionner une heure et une phrase.");
    return;
  }

  // Create routine item
  let routine = JSON.parse(localStorage.getItem("dailyRoutine") || "[]");
  routine.push({
    time: time,
    phrase: selectedPhrase,
    language: lang,
  });

  // Sort by time
  routine.sort((a, b) => a.time.localeCompare(b.time));

  localStorage.setItem("dailyRoutine", JSON.stringify(routine));
  loadRoutine();

  // Reset form
  document.getElementById("taskTime").value = "";
  document.getElementById("keywordInput").value = "";
  selectedPhrase = null;
});

// Load routine
function loadRoutine() {
  let routine = JSON.parse(localStorage.getItem("dailyRoutine") || "[]");
  let list = document.getElementById("routineList");
  list.innerHTML = "";

  routine.forEach((item) => {
    let li = document.createElement("li");
    li.className = "list-group-item";
    li.innerHTML = `
            <strong>${
              item.time
            }</strong> - <span id="phrase-${item.time.replace(":", "")}">${
      item.phrase[item.language]
    }</span>
            <div class="mt-2">
                <button class="btn btn-sm btn-outline-primary me-1" style="background-color: #e9ecef;" onclick="switchLang('${item.time.replace(
                  ":",
                  ""
                )}', 'creole')">🇲🇬</button>
                <button class="btn btn-sm btn-outline-primary me-1" style="background-color: #e9ecef;" onclick="switchLang('${item.time.replace(
                  ":",
                  ""
                )}', 'francais')">🇫🇷</button>
                <button class="btn btn-sm btn-outline-primary me-1" style="background-color: #e9ecef;" onclick="switchLang('${item.time.replace(
                  ":",
                  ""
                )}', 'anglais')">🇬🇧</button>
                <button class="btn btn-sm btn-outline-danger ms-2" style="background-color: #f8d7da;" onclick="removeTask('${
                  item.time
                }')"><i class="fas fa-trash"></i></button>
            </div>
        `;
    list.appendChild(li);
  });
}

function switchLang(id, lang) {
  let routine = JSON.parse(localStorage.getItem("dailyRoutine") || "[]");
  let item = routine.find((i) => i.time.replace(":", "") === id);
  if (item) {
    let text = item.phrase[lang];
    document.getElementById(`phrase-${id}`).textContent = text;
  }
}

function removeTask(timeStr) {
  let routine = JSON.parse(localStorage.getItem("dailyRoutine") || "[]");
  routine = routine.filter((i) => i.time !== timeStr);
  localStorage.setItem("dailyRoutine", JSON.stringify(routine));
  loadRoutine();
}
