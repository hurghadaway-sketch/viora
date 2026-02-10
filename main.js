let userProfile = {
  skinType: "",
  sensitivity: "",
  acne: "",
  pigmentation: ""
};

const questions = [
  {
    q: "ما نوع بشرتك؟",
    a: ["دهنية","جافة","مختلطة","حساسة"],
    k: "skinType"
  },
  {
    q: "هل بشرتك تتحسس بسرعة؟",
    a: ["نعم","لا"],
    k: "sensitivity"
  },
  {
    q: "هل لديك حبوب ملتهبة؟",
    a: ["نعم","خفيفة","لا"],
    k: "acne"
  },
  {
    q: "درجة التصبغات؟",
    a: ["خفيفة","متوسطة","عنيدة"],
    k: "pigmentation"
  }
];

let qIndex = 0;

async function startScan(){
  document.getElementById("screen-start").classList.add("hidden");
  document.getElementById("screen-scan").classList.remove("hidden");

  const video = document.getElementById("camera");
  const stream = await navigator.mediaDevices.getUserMedia({ video:true });
  video.srcObject = stream;

  document.getElementById("scanSound").play();

  setTimeout(()=>{
    document.getElementById("screen-scan").classList.add("hidden");
    startQuestions();
  },5000);
}

function startQuestions(){
  document.getElementById("screen-questions").classList.remove("hidden");
  showQuestion();
}

function showQuestion(){
  const q = questions[qIndex];
  document.getElementById("questionText").innerText = q.q;
  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  q.a.forEach(ans=>{
    const btn = document.createElement("button");
    btn.innerText = ans;
    btn.onclick = ()=> {
      userProfile[q.k] = ans;
      qIndex++;
      qIndex < questions.length ? showQuestion() : showResult();
    };
    answersDiv.appendChild(btn);
  });
}

function showResult(){
  document.getElementById("screen-questions").classList.add("hidden");
  document.getElementById("screen-result").classList.remove("hidden");

  let routine = "روتين اقتصادي";
  if(userProfile.pigmentation === "عنيدة") routine = "روتين سوبر";
  else if(userProfile.acne !== "لا") routine = "روتين متوسط";

  const text = `
نوع البشرة: ${userProfile.skinType}
حساسية: ${userProfile.sensitivity}
حبوب: ${userProfile.acne}
تصبغات: ${userProfile.pigmentation}

الروتين المقترح: ${routine}

التحسن المتوقع:
2–4 أسابيع مع الالتزام
`;

  document.getElementById("resultText").innerText = text;
}

function sendWhatsApp(){
  const msg = encodeURIComponent(document.getElementById("resultText").innerText);
  window.open("https://wa.me/201XXXXXXXXX?text="+msg,"_blank");
}
let beforeImg, afterImg;

function loadBefore(e){
  beforeImg = new Image();
  beforeImg.src = URL.createObjectURL(e.target.files[0]);
}

function loadAfter(e){
  afterImg = new Image();
  afterImg.src = URL.createObjectURL(e.target.files[0]);
  afterImg.onload = compareImages;
}

function compareImages(){
  const canvas = document.getElementById("compareCanvas");
  const ctx = canvas.getContext("2d");

  ctx.drawImage(beforeImg,0,0,300,300);
  const beforeData = ctx.getImageData(0,0,300,300).data;

  ctx.drawImage(afterImg,0,0,300,300);
  const afterData = ctx.getImageData(0,0,300,300).data;

  let beforeSum = 0, afterSum = 0;

  for(let i=0;i<beforeData.length;i+=4){
    beforeSum += beforeData[i];   // Red channel
    afterSum += afterData[i];
  }

  const improvement = Math.round(((afterSum - beforeSum) / beforeSum) * 100);

  document.getElementById("progressResult").innerText =
   `نسبة التحسن التقريبية: ${improvement}%`;
        }
function saveProgress(){
  localStorage.setItem("vioraUser", JSON.stringify(userProfile));
  alert("تم حفظ حالتك للمتابعة");
}
function medicalProgressScore(){
  let score = 0;

  if(userProfile.acne === "لا") score += 30;
  if(userProfile.pigmentation !== "عنيدة") score += 30;
  if(userProfile.sensitivity === "لا") score += 20;

  return score;
              }
const medicalScore = medicalProgressScore();
resultText.innerText += `\nالتقييم الطبي للتحسن: ${medicalScore}%`;
function chooseActiveIngredients(){
  let actives = [];

  if(userProfile.acne !== "لا"){
    actives.push("Adapalene");
  }

  if(userProfile.pigmentation === "عنيدة"){
    actives.push("Alpha Arbutin","Vitamin C");
  }

  if(userProfile.sensitivity === "نعم"){
    actives = actives.filter(a => a !== "Retinol");
  }

  return actives;
}

const productsDB = {
  "Adapalene": ["Differin Gel","Adapco"],
  "Vitamin C": ["Nano Treat VC","Eva VC"],
  "Alpha Arbutin": ["Dear Whitening","Kolagra Whitening"],
  "Retinol": ["Acretin","Natavis Retinol"]
};

function generateProducts(){
  const actives = chooseActiveIngredients();
  let output = "\nالمنتجات المقترحة:\n";

  actives.forEach(a=>{
    output += `- ${productsDB[a].join(" / ")}\n`;
  });

  return output;
}
resultText.innerText += generateProducts();

function generateQR(username){
  const qr = document.getElementById("qrCanvas");
  const ctx = qr.getContext("2d");
  const size = 200;
  qr.width = qr.height = size;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0,0,size,size);

  ctx.fillStyle = "#000";
  const data = btoa(`https://hurghadaway-sketch.github.io/?user=${username}`);

  let x = 10, y = 10;
  for(let i=0;i<data.length;i++){
    if(data.charCodeAt(i) % 2 === 0){
      ctx.fillRect(x,y,6,6);
    }
    x += 8;
    if(x > size - 10){
      x = 10;
      y += 8;
    }
  }
}

function saveProgress(){
  const username = prompt("اكتب اسم المستخدم (غير مكرر)");
  if(!username) return;

  userProfile.username = username;
  userProfile.startDate = new Date().toISOString();

  localStorage.setItem("viora_"+username, JSON.stringify(userProfile));

  generateQR(username);
  alert("تم حفظ الحالة وإنشاء QR");
}

window.onload = ()=>{
  const params = new URLSearchParams(window.location.search);
  const user = params.get("user");

  if(user){
    const data = localStorage.getItem("viora_"+user);
    if(data){
      userProfile = JSON.parse(data);
      showResult();
    } else {
      alert("لا توجد بيانات لهذا المستخدم");
    }
  }
};
function openDashboard(){
  document.getElementById("dashboard").classList.remove("hidden");
  const list = document.getElementById("clientsList");
  list.innerHTML = "";

  for(let key in localStorage){
    if(key.startsWith("viora_")){
      const data = JSON.parse(localStorage.getItem(key));
      list.innerHTML += `
        <div style="border:1px solid #00eaff;padding:8px;margin:6px">
          👤 ${data.username}<br>
          🗓️ ${data.startDate}<br>
          🧴 ${data.skinType} – ${data.pigmentation}
        </div>`;
    }
  }
}

function drawProgressChart(before, after){
  const c = document.getElementById("chartCanvas");
  const ctx = c.getContext("2d");

  ctx.clearRect(0,0,c.width,c.height);

  ctx.fillStyle="#00eaff";
  ctx.fillRect(50,150-before,50,before);

  ctx.fillStyle="#00ff88";
  ctx.fillRect(150,150-after,50,after);

  ctx.fillStyle="#fff";
  ctx.fillText("قبل",60,145);
  ctx.fillText("بعد",160,145);
}

drawProgressChart(60, 90); // مثال تحسن


function generatePDF(){
  const text = document.getElementById("resultText").innerText;
  const blob = new Blob([text], {type: "application/pdf"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Viora_Report.pdf";
  link.click();
}
function generateQR(username){
  const qr = document.getElementById("qrCanvas");
  const ctx = qr.getContext("2d");
  const size = 200;
  qr.width = qr.height = size;

  ctx.fillStyle="#fff";
  ctx.fillRect(0,0,size,size);

  const link = `https://wa.me/201063994139?text=متابعة حالة ${username}`;
  const data = btoa(link);

  ctx.fillStyle="#000";
  let x=10,y=10;
  for(let i=0;i<data.length;i++){
    if(data.charCodeAt(i)%2===0) ctx.fillRect(x,y,6,6);
    x+=8;
    if(x>size-10){x=10;y+=8;}
  }
}

