let user = {
  name: "",
  scan: {},
  answers: {},
  problems: [],
  routine: []
};

function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goToScan() {
  const n = document.getElementById("username").value.trim();
  if (!n) return alert("Enter username / ادخل الاسم");
  user.name = n;
  show("scan");
}

document.getElementById("imageInput").onchange = e => {
  document.getElementById("preview").src = URL.createObjectURL(e.target.files[0]);
};

function analyzeImage() {
  const img = document.getElementById("preview");
  if (!img.src) return alert("Upload image / ارفع صورة");

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let brightness = 0, contrast = 0;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    brightness += avg;
    contrast += Math.abs(avg - 128);
  }

  brightness /= data.length / 4;
  contrast /= data.length / 4;

  user.scan = {
    oily: brightness > 150,
    dull: brightness < 110,
    pigmentation: contrast > 50
  };

  let txt = "Scan indicators / مؤشرات الاسكان:<br>";
  if (user.scan.oily) txt += "• Oily shine / لمعان زائد<br>";
  if (user.scan.dull) txt += "• Dull skin / بهتان<br>";
  if (user.scan.pigmentation) txt += "• Uneven tone / تفاوت لون<br>";

  document.getElementById("scanResult").innerHTML = txt;
  startQuestions();
}

let questionFlow = [];
let qIndex = 0;

function startQuestions() {
  questionFlow = [
    {
      q: "Do you have acne? / هل تعاني من حبوب؟",
      a: ["No / لا", "Yes / نعم"],
      key: "acne",
      next: ans => ans.startsWith("Yes") ? "acneType" : null
    },
    {
      id: "acneType",
      q: "Acne type? / نوع الحبوب؟",
      a: ["Blackheads", "Simple pimples", "Inflamed"],
      key: "acneType"
    },
    {
      q: "Do you have pigmentation? / هل توجد تصبغات؟",
      a: ["No / لا", "Yes / نعم"],
      key: "pig",
      next: ans => ans.startsWith("Yes") ? "pigLevel" : null
    },
    {
      id: "pigLevel",
      q: "Pigmentation level? / درجة التصبغات؟",
      a: ["Light", "Moderate", "Stubborn"],
      key: "pigLevel"
    },
    {
      q: "Sensitive skin? / هل بشرتك حساسة؟",
      a: ["Yes / نعم", "No / لا"],
      key: "sensitive"
    }
  ];

  qIndex = 0;
  show("questions");
  loadQuestion();
}

function loadQuestion() {
  const q = questionFlow[qIndex];
  document.getElementById("qTitle").innerText = q.q;
  const box = document.getElementById("qAnswers");
  box.innerHTML = "";

  q.a.forEach(ans => {
    const b = document.createElement("button");
    b.innerText = ans;
    b.onclick = () => {
      user.answers[q.key] = ans;
      if (q.next && q.next(ans)) {
        qIndex = questionFlow.findIndex(x => x.id === q.next(ans));
      } else {
        qIndex++;
      }
      qIndex < questionFlow.length ? loadQuestion() : buildResult();
    };
    box.appendChild(b);
  });
}

function buildResult() {
  user.problems = [];
  if (user.scan.oily) user.problems.push("Oily skin / دهون");
  if (user.scan.pigmentation || user.answers.pig?.startsWith("Yes"))
    user.problems.push("Pigmentation / تصبغات");
  if (user.answers.acne?.startsWith("Yes"))
    user.problems.push("Acne / حبوب");

  let txt = `<b>${user.name}</b><br><br>Detected problems / المشكلات:<br>`;
  user.problems.forEach(p => txt += "• " + p + "<br>");

  document.getElementById("analysis").innerHTML = txt;
  show("result");
}

function showRoutine() {
  let r = "";

  if (user.problems.includes("Oily skin / دهون")) {
    r += `
    <b>Oil Control / تنظيم الدهون</b><br>
    Ingredient: Niacinamide<br>
    Benefit: Reduce oil & pores<br>
    Use: Morning<br><br>`;
  }

  if (user.problems.includes("Pigmentation / تصبغات")) {
    r += `
    <b>Pigmentation Care / التصبغات</b><br>
    Ingredient: Vitamin C + Alpha Arbutin<br>
    Benefit: Brightening & tone correction<br>
    Use: Morning / Evening<br><br>`;
  }

  if (user.problems.includes("Acne / حبوب")) {
    r += `
    <b>Acne Care / الحبوب</b><br>
    Ingredient: Salicylic Acid<br>
    Benefit: Clean pores & reduce breakouts<br>
    Use: Evening – 3x weekly<br><br>`;
  }

  document.getElementById("routineBox").innerHTML = r;
  show("routine");
}

function sendWhats() {
  let msg = `VIORA REPORT\nName: ${user.name}\n\nProblems:\n`;
  user.problems.forEach(p => msg += "- " + p + "\n");
  msg += "\nRoutine included.\nDuration: 6–8 weeks";
  window.open("https://wa.me/201063994139?text=" + encodeURIComponent(msg));
}
