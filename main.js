import { db, storage } from "./firebase-config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

let profile = {};

async function startScan(){
  hideAll();
  show("scan");

  const video = document.getElementById("camera");
  const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:false});
  video.srcObject = stream;
  document.getElementById("scanSound").play();

  setTimeout(()=>{
    stream.getTracks().forEach(t=>t.stop());
    hideAll();
    show("questions");
  },4000);
}

window.startScan = startScan;

function generateRoutine(){
  profile.skin = skinType.value;
  profile.acne = acne.value;
  profile.pig = pigmentation.value;

  let routine = "روتين اقتصادي";
  let price = "400 جنيه";

  if(profile.pig==="عنيدة"){
    routine="روتين سوبر تفتيح";
    price="900 جنيه";
  }

  profile.routine = routine;

  document.getElementById("routineBox").innerHTML =
    `<h3>${routine}</h3><p>السعر التقريبي: ${price}</p>`;

  hideAll();
  show("result");
}

window.generateRoutine = generateRoutine;

async function saveBefore(input){
  const file = input.files[0];
  const imageRef = ref(storage, `images/${Date.now()}.jpg`);
  await uploadBytes(imageRef,file);
  profile.before = await getDownloadURL(imageRef);
}

window.saveBefore = saveBefore;

async function saveUser(){
  profile.username = username.value;
  await setDoc(doc(db,"users",profile.username),profile);
  alert("تم حفظ الحالة");
}

window.saveUser = saveUser;

function sendWhatsApp(){
  window.open(`https://wa.me/201XXXXXXXXX?text=${encodeURIComponent(profile.routine)}`);
}

window.sendWhatsApp = sendWhatsApp;

function generatePDF(){
  const blob = new Blob([JSON.stringify(profile,null,2)],{type:"application/pdf"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "viora-report.pdf";
  a.click();
}

window.generatePDF = generatePDF;

function hideAll(){
  document.querySelectorAll(".screen").forEach(s=>s.classList.add("hidden"));
}
function show(id){ document.getElementById(id).classList.remove("hidden"); }
