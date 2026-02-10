import { db, storage } from './firebase-config.js';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// ---------------- UI Helpers ----------------
function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ---------------- User Handling ----------------
async function checkUsername(username){
  if(!username) return true;
  const refUser = doc(db,"users",username);
  const snap = await getDoc(refUser);
  return snap.exists();
}

async function createUser(username){
  const refUser = doc(db,"users",username);
  await setDoc(refUser,{createdAt:new Date(),sessions:[]});
}

// ---------------- Camera ----------------
let video = document.getElementById("video");
let cameraActive=false;
async function startCamera(){
  if(cameraActive) return;
  const stream = await navigator.mediaDevices.getUserMedia({video:true});
  video.srcObject = stream;
  cameraActive=true;
}

// ---------------- Typewriter + Loader ----------------
const scanMessages=[
  "INITIALIZING AI CORE...",
  "DETECTING FACIAL LANDMARKS...",
  "ANALYZING SKIN TEXTURE...",
  "CALCULATING SKIN SCORE...",
  "FINALIZING RESULTS..."
];
let textIndex=0,charIndex=0,scanText=document.getElementById("scanText");
function startTypewriter(){
  scanText.innerHTML=""; textIndex=0; charIndex=0;
  typeNextChar();
}
function typeNextChar(){
  if(textIndex >= scanMessages.length) return;
  let current=scanMessages[textIndex];
  if(charIndex < current.length){
    scanText.innerHTML += current.charAt(charIndex);
    charIndex++;
    setTimeout(typeNextChar,50);
  }else{
    setTimeout(()=>{
      charIndex=0; scanText.innerHTML="";
      textIndex++; typeNextChar();
    },800);
  }
}

// ---------------- Sound + Haptic ----------------
function playScanEffects(){
  const sound=document.getElementById("scanSound");
  sound.currentTime=0;
  sound.play().catch(()=>{});
  if(navigator.vibrate) navigator.vibrate([100,50,100,50,100]);
}

// ---------------- Glitch ----------------
function endScan(){
  scanText.classList.add("glitch");
  scanText.innerHTML="FINALIZING DATA...";
  setTimeout(()=>{
    scanText.classList.remove("glitch");
    show("skincarePhase");
    currentPhaseIndex=0;
    showPhase(currentPhaseIndex);
  },1500);
}

// ---------------- Start AI Scan ----------------
export function startAIAnalysis(){
  const user = document.getElementById("username").value.trim();
  if(!user){ alert("ادخل اسم المستخدم"); return;}
  checkUsername(user).then(exists=>{
    if(exists){ alert("اسم المستخدم مستخدم من قبل"); return;}
    createUser(user).then(()=>{
      show('scan');
      startCamera();
      document.getElementById("scanOverlay").classList.remove("hidden");
      playScanEffects();
      startTypewriter();
      setTimeout(()=>{
        document.getElementById("scanOverlay").classList.add("hidden");
        endScan();
      },6000);
    });
  });
}

// ---------------- Skincare Phases ----------------
const skincarePhases = [
  {
    title: "المرحلة الأولى: الترطيب والتهدئة",
    duration: "7 أيام",
    goal: "إصلاح الحاجز الجلدي، تقليل الالتهاب، تجهيز البشرة لتحمّل العلاجات",
    products: {
      serum: [
        {name:"Nano Treat HA & V.C", notes:"أقوى نضارة"},
        {name:"Kolagra HA & V.C", notes:"متوازن"},
        {name:"Eva HA & V.C", notes:"اقتصادي"}
      ],
      moisturizer: [
        {name:"Panthenol Cream", notes:"B5"}
      ],
      cleanser: [
        {name:"Eva Face Wash", notes:"عادية / جافة"},
        {name:"Garnier SkinActive Vit C", notes:"بهتان"},
        {name:"Kolagra Cleanser", notes:"تصبغات"},
        {name:"Starville Gentle", notes:"حساسة"}
      ],
      sunscreen: [
        {name:"Infinity Whitening SPF50+", notes:"تفتيح + حماية"},
        {name:"Nano Treat Sunscreen", notes:"حماية عالية"},
        {name:"Cleo Sunscreen", notes:"لطيف"}
      ],
      restrictions:["ممنوع أي ريتينويد أو تقشير"]
    }
  },
  {
    title: "المرحلة الثانية: علاج حب الشباب + البقع + الهالات",
    duration: "4–6 أسابيع",
    goal: "السيطرة على الحبوب، منع آثار جديدة، بدء تجديد الخلايا",
    products: {
      activeIngredients:["Vitamin C","Niacinamide 5–10%","Retinol","Adapalene","Tretinoin"],
      acne: [
        {name:"Clindamycin + Benzoyl Peroxide", notes:"قتل البكتيريا"},
        {name:"Adapalene / Adagel", notes:"تنظيم المسام"}
      ],
      scars: [
        {name:"Acretin", notes:"Tretinoin"}
      ],
      eye: [
        {name:"Nano Treat 24K Gold Serum", notes:"Hyaluronic + Gold"},
        {name:"Dear Eye Cream", notes:"Caffeine + Vit C"},
        {name:"Eva Collagen Eye Cream", notes:"Collagen"},
        {name:"Kolagra Eye Cream", notes:"Niacinamide"}
      ],
      restrictions:["لا Adapalene + Acretin في نفس الليلة"]
    }
  },
  {
    title: "المرحلة الثالثة: التفتيح الشامل",
    duration: "4–8 أسابيع",
    goal: "توحيد اللون، تقليل التصبغات العنيدة، نضارة عامة",
    products: {
      activeIngredients:["Vitamin C","Niacinamide 5–10%","Alpha Arbutin","Retinol خفيف/ليلي"],
      whitening: [
        {name:"Nano Treat Whitening", notes:"قوي"},
        {name:"Dear Whitening", notes:"متوسط"},
        {name:"Natavis Retinol", notes:"تفتيح + تجديد"},
        {name:"Eva Collagen Whitening Cream", notes:"نضارة"},
        {name:"Kolagra Whitening Gel", notes:"مناسب الدهني"}
      ]
    }
  }
];

let currentPhaseIndex=0;

export function showPhase(index){
  const phase = skincarePhases[index];
  document.getElementById("phaseTitle").innerText = phase.title;
  document.getElementById("phaseGoal").innerText = phase.goal;
  const container = document.getElementById("phaseProducts");
  container.innerHTML="";

  for(let category in phase.products){
    if(category==="restrictions" || category==="activeIngredients") continue;
    const list = phase.products[category];
    container.innerHTML += `<h4>${category.toUpperCase()}</h4>`;
    list.forEach(p=>{
      container.innerHTML += `<label><input type="radio" name="${category}"> ${p.name} (${p.notes})</label><br>`;
    });
  }

  if(phase.products.restrictions){
    container.innerHTML += `<p style="color:#ff5252"><b>تنبيه:</b> ${phase.products.restrictions.join(", ")}</p>`;
  }
}

export function nextPhase(){
  if(currentPhaseIndex < skincarePhases.length-1){
    currentPhaseIndex++;
    showPhase(currentPhaseIndex);
  }else{
    alert("لقد أكملت كل المراحل!");
    show("result");
  }
}

// ---------------- Progress + Firebase ----------------
export async function saveSession(){
  const d = {
    user: document.getElementById("username").value,
    phase: currentPhaseIndex,
    date: new Date().toLocaleDateString()
  };
  const refUser = doc(db,"users",d.user);
  await updateDoc(refUser,{sessions:arrayUnion(d)});
  alert("تم حفظ البيانات");
}

export async function goProgress(){ show("progress"); }

export async function loadUser(){
  const name=document.getElementById("loginUser").value;
  const refUser = doc(db,"users",name);
  const snap = await getDoc(refUser);
  if(!snap.exists()){ document.getElementById("report").innerText="لا توجد بيانات"; return; }
  const d = snap.data();
  document.getElementById("report").innerHTML=`<div class="card">
  <b>آخر مرحلة:</b> ${d.sessions[d.sessions.length-1]?.phase || "-"}<br>
  <b>تاريخ آخر جلسة:</b> ${d.sessions[d.sessions.length-1]?.date || "-"}
  </div>`;

  const ctx = document.getElementById('progressChart').getContext('2d');
  const labels = d.sessions.map((s,i)=>`جلسة ${i+1}`);
  const dataPoints = d.sessions.map((s,i)=>i+1);
  new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'تقدم البشرة',data:dataPoints,borderColor:'#00eaff',tension:0.3}]},options:{responsive:true}});
}

// ---------------- Before/After Image ----------------
export async function uploadImage(file,username,type){
  const imgRef = ref(storage,`${username}/${type}_${Date.now()}.jpg`);
  await uploadBytes(imgRef,file);
  return await getDownloadURL(imgRef);
}
window.startAIAnalysis = async function(){
  const username = document.getElementById("username").value;
  if(!username){
    alert("ادخل اسم المستخدم");
    return;
  }
  show("scan");
  await startCamera();
}
const scanSound = new Audio("./assets/scanSound.mp3");
scanSound.volume = 0.7;
scanSound.currentTime = 0;
scanSound.play().catch(() => {});
const startBtn = document.getElementById("startScan");
const camera = document.getElementById("camera");
const scanner = document.getElementById("scanner");
const resultBox = document.getElementById("result");
const sound = document.getElementById("scanSound");

function playScanSound() {
  sound.currentTime = 0;
  sound.play();
}

function typeWriter(text, speed = 40) {
  resultBox.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    resultBox.innerHTML += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" }
  });
  camera.srcObject = stream;
  camera.style.display = "block";
}

function fakeAIAnalysis() {
  return `
جاري تحليل البشرة...
✔ نوع البشرة: مختلطة مائلة للدهنية
✔ مستوى الترطيب: متوسط
✔ المسام: واضحة بمنطقة T-Zone
✔ التصبغات: خفيفة إلى متوسطة
✔ الهالات: موجودة (إجهاد / قلة نوم)

التوصية:
• روتين تهدئة أول 7 أيام
• ثم علاج تدريجي
• واقي شمس إلزامي

جاهز للمتابعة 📊
`;
}

startBtn.addEventListener("click", async () => {
  try {
    await startCamera();

    scanner.style.display = "block";
    playScanSound();

    setTimeout(() => {
      scanner.style.display = "none";
      const report = fakeAIAnalysis();
      typeWriter(report);
    }, 5000);

  } catch (e) {
    alert("يرجى السماح للكاميرا وتشغيل الموقع عبر HTTPS");
    console.error(e);
  }
});
