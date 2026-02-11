let userData = {
  username: "",
  skinType: "",
  acne: "",
  pigmentation: "",
  tolerance: "",
  routineLevel: ""
};

const questions = [
  {
    q: "What is your skin type? / نوع بشرتك؟",
    a: ["Oily / دهنية", "Dry / جافة", "Combination / مختلطة", "Sensitive / حساسة"],
    key: "skinType"
  },
  {
    q: "Do you have acne? / هل تعاني من حبوب؟",
    a: ["No", "Mild", "Inflamed", "Marks only"],
    key: "acne"
  },
  {
    q: "Pigmentation level? / درجة التصبغات؟",
    a: ["Light", "Medium", "Severe"],
    key: "pigmentation"
  },
  {
    q: "Did your skin react before? / هل بشرتك تتحسس؟",
    a: ["No", "Yes"],
    key: "tolerance"
  }
];

let currentQuestion = 0;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function startScan() {
  const name = document.getElementById("usernameInput").value.trim();
  if (!name) {
    alert("Enter username");
    return;
  }
  userData.username = name;
  showScreen("scanScreen");

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      document.getElementById("camera").srcObject = stream;
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        startQuestions();
      }, 4000);
    })
    .catch(() => alert("Camera permission required"));
}

function startQuestions() {
  showScreen("questionScreen");
  loadQuestion();
}

function loadQuestion() {
  const q = questions[currentQuestion];
  document.getElementById("questionTitle").innerText = q.q;
  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  q.a.forEach(ans => {
    const btn = document.createElement("button");
    btn.innerText = ans;
    btn.onclick = () => {
      userData[q.key] = ans;
      currentQuestion++;
      if (currentQuestion < questions.length) {
        loadQuestion();
      } else {
        analyzeResult();
      }
    };
    answersDiv.appendChild(btn);
  });
}

function analyzeResult() {
  let text = `
  Username: ${userData.username}<br>
  Skin Type: ${userData.skinType}<br>
  Acne: ${userData.acne}<br>
  Pigmentation: ${userData.pigmentation}
  `;

  if (userData.tolerance === "Yes") {
    userData.routineLevel = "Safe Routine";
    text += "<br><b>Recommended:</b> Conservative Routine";
  } else {
    userData.routineLevel = "Advanced Routine";
    text += "<br><b>Recommended:</b> Faster Results Routine";
  }

  document.getElementById("analysisResult").innerHTML = text;
  showScreen("resultScreen");
}

function showRoutine() {
  let routineHTML = `
  <h3>${userData.routineLevel}</h3>
  <ul>
    <li>Phase 1: Hydration (HA + Panthenol)</li>
    <li>Phase 2: Treatment (Vitamin C / Retinoid)</li>
    <li>Phase 3: Maintenance (Sunscreen + Moisturizer)</li>
  </ul>
  `;
  document.getElementById("routineResult").innerHTML = routineHTML;
  showScreen("routineScreen");
}

function sendWhatsApp() {
  const msg = `
VIORA Report
Username: ${userData.username}
Routine: ${userData.routineLevel}
`;
  const url = `https://wa.me/201063994139?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}
