// ============================
// روتينات البشرة
// ============================
const routines = {
  "أساسي": {
    description: "ترطيب ونضارة يومية",
    active: ["هيالورونيك أسيد", "فيتامين E", "مضادات أكسدة خفيفة"],
    duration: "4 أسابيع",
    stages: { "ترطيب": "صباحاً ومساءً - كريم مرطب خفيف", "صيانة": "واقي شمس SPF50 + تنظيف يومي" }
  },
  "متوسط": {
    description: "ترطيب + علاج خفيف + تفتيح تدريجي",
    active: ["فيتامين C", "Niacinamide", "حمض الجليكوليك 5%"],
    duration: "6 أسابيع",
    stages: { "ترطيب": "صباحاً ومساءً - سيروم + كريم مرطب", "علاج": "3 مرات أسبوعياً - تقشير لطيف", "صيانة": "واقي شمس + ترطيب يومي" }
  },
  "قوي": {
    description: "تفتيح وتجديد + علاج مشاكل عميقة",
    active: ["Retinol", "فيتامين C مركز", "حمض الهيالورونيك", "Niacinamide"],
    duration: "8 أسابيع",
    stages: { "ترطيب": "صباحاً ومساءً - كريم غني", "علاج": "4 مرات أسبوعياً - سيروم علاجي + مقشر متوسط", "صيانة": "واقي شمس + كريم ليلي + مرطب مكثف" }
  }
};

// ============================
// مناطق الوجه
// ============================
const faceZones = ["الجبهة","الأنف","الذقن","الخد الأيمن","الخد الأيسر","حول العين"];
const zoneColors = {"جفاف":"blue","دهون":"red","تصبغات":"yellow","حبوب":"orange","هالات":"purple","بهتان":"gray","اسمرار":"brown"};

// ============================
// بيانات العميل
// ============================
let clientData = {};

// ============================
// جمع معلومات العميل من النموذج
// ============================
function startAnalysis(){
  clientData.skinType=document.getElementById('skinType').value;
  clientData.pigmentationExist=document.getElementById('pigmentationExist').value;
  clientData.pigmentationAreas=document.getElementById('pigmentationAreas').value.split(",").map(s=>s.trim());
  clientData.acneExist=document.getElementById('acneExist').value;
  clientData.acneTypes=document.getElementById('acneTypes').value.split(",").map(s=>s.trim());
  clientData.darkCircles=document.getElementById('darkCircles').value==="yes";
  clientData.dullness=document.getElementById('dullness').value==="yes";
  clientData.sensitivity=document.getElementById('sensitivity').value.split(",").map(s=>s.trim());
  alert("تم حفظ معلومات العميل، يمكنك الآن رفع أو التقاط الصورة للوجه.");
}

// ============================
// تحليل الصورة
// ============================
function analyzeImage() {
  const file = document.getElementById('faceImage').files[0];
  if(!file){ alert("اختر صورة أولاً"); return; }
  const img = new Image();
  const reader = new FileReader();
  reader.onload = function(e){ img.src = e.target.result; }
  reader.readAsDataURL(file);
  img.onload = function(){ processFaceImage(img); }
}

// ============================
// الكاميرا
// ============================
function startCamera() {
  const video = document.getElementById('video');
  video.style.display = 'block';
  navigator.mediaDevices.getUserMedia({ video:true })
  .then(stream=>{
    video.srcObject=stream;
    const captureBtn=document.createElement('button');
    captureBtn.innerText="التقاط وتحليل";
    captureBtn.onclick=()=>captureFromVideo(video);
    document.querySelector('main').appendChild(captureBtn);
  })
  .catch(err=>alert("لا يمكن الوصول للكاميرا: "+err));
}

function captureFromVideo(video){
  const canvas=document.getElementById('canvas');
  const ctx=canvas.getContext('2d');
  canvas.width=300; canvas.height=300;
  ctx.drawImage(video,0,0,300,300);
  const img=new Image();
  img.src=canvas.toDataURL();
  img.onload=function(){ processFaceImage(img); }
}

// ============================
// معالجة الوجه + دمج معلومات العميل
// ============================
function processFaceImage(img){
  const canvas=document.getElementById('canvas');
  const ctx=canvas.getContext('2d');
  canvas.width=300; canvas.height=300;
  ctx.drawImage(img,0,0,300,300);
  const data=ctx.getImageData(0,0,300,300).data;

  const zonesData={};
  faceZones.forEach(z=>zonesData[z]={problem:[]});

  // دمج معلومات العميل
  if(clientData.pigmentationExist==="yes"){
    clientData.pigmentationAreas.forEach(a=>{if(faceZones.includes(a)) zonesData[a].problem.push("تصبغات");});
  }
  if(clientData.acneExist==="yes"){
    clientData.acneTypes.forEach(a=>{
      faceZones.forEach(z=>zonesData[z].problem.push("حبوب"));
    });
  }
  if(clientData.darkCircles) zonesData["حول العين"].problem.push("هالات");
  if(clientData.dullness) faceZones.forEach(z=>zonesData[z].problem.push("بهتان"));

  // إضافة التحليل من الصورة (محاكاة بسيطة)
  faceZones.forEach(z=>{
    const avgB=Math.random()*255; // محاكاة السطوع
    if(avgB<60) zonesData[z].problem.push("جفاف");
    if(avgB>200) zonesData[z].problem.push("دهون");
    if(avgB>80 && avgB<120) zonesData[z].problem.push("اسمرار");
  });

  displayResults(zonesData);
}

// ============================
// عرض النتائج + الروتين
// ============================
function displayResults(zonesData){
  const faceMap=document.getElementById('faceMap');
  faceMap.innerHTML="";
  faceMap.style.display="block";

  const zoneCoords={
    "الجبهة":[100,20,100],
    "الأنف":[130,120,40],
    "الذقن":[120,220,80],
    "الخد الأيمن":[220,120,50],
    "الخد الأيسر":[60,120,50],
    "حول العين":[120,160,60]
  };

  faceZones.forEach(z=>{
    zonesData[z].problem.forEach(prob=>{
      const div=document.createElement('div');
      div.className="zone";
      div.style.left=(zoneCoords[z][0]-zoneCoords[z][2]/2)+"px";
      div.style.top=(zoneCoords[z][1]-zoneCoords[z][2]/2)+"px";
      div.style.width=zoneCoords[z][2]+"px";
      div.style.height=zoneCoords[z][2]+"px";
      div.style.backgroundColor=zoneColors[prob];
      faceMap.appendChild(div);
    });
  });

  let html=`<h3>نوع البشرة العام: ${clientData.skinType}</h3>`;
  html+=`<p><strong>المشاكل حسب المنطقة:</strong></p>`;
  faceZones.forEach(z=>{
    html+=`<p><strong>${z}:</strong> ${zonesData[z].problem.length>0?zonesData[z].problem.join(", "):"لا توجد مشاكل واضحة"}</p>`;
  });

  // اختيار روتين حسب الحساسية
  let selectedRoutine="متوسط";
  const r=routines[selectedRoutine];
  const filteredActive=r.active.filter(a=>!clientData.sensitivity.includes(a));

  html+=`<h3>الروتين المقترح</h3>`;
  html+=`<div class="routine"><h4>${selectedRoutine} - ${r.description}</h4>`;
  html+=`<p><strong>المواد الفعالة:</strong> ${filteredActive.join(", ")}</p>`;
  html+=`<p><strong>مدة الروتين:</strong> ${r.duration}</p>`;
  html+=`<p><strong>مراحل الروتين:</strong></p><ul>`;
  Object.keys(r.stages).forEach(stage=>{
    html+=`<li><strong>${stage}:</strong> ${r.stages[stage]}</li>`;
  });
  html+=`</ul></div>`;

  const analysisDiv=document.getElementById('analysis');
  analysisDiv.innerHTML=html;
  analysisDiv.style.display='block';
  document.getElementById('whatsappBtn').style.display='block';
}

// ============================
// إرسال الروتين إلى واتساب
// ============================
function sendWhatsApp(){
  const analysisDiv=document.getElementById('analysis');
  const text = encodeURIComponent(analysisDiv.innerText);
  const url = `https://wa.me/201063994139?text=${text}`;
  window.open(url,"_blank");
}
