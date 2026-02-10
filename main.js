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

let aiResults = {}; // نتائج الذكاء الاصطناعي
let clientData = {}; // إجابات العميل

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
  img.onload = function(){ processFaceAI(img); }
}

// الكاميرا
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
  img.onload=function(){ processFaceAI(img); }
}

// ============================
// معالجة الوجه + الذكاء الاصطناعي (محاكاة)
// ============================
function processFaceAI(img){
  // المحاكاة: لكل منطقة نختار مشاكل عشوائية بسيطة
  aiResults={};
  faceZones.forEach(z=>{
    aiResults[z]={problem:[]};
    const rand=Math.random();
    if(rand<0.3) aiResults[z].problem.push("جفاف");
    if(rand>0.7) aiResults[z].problem.push("دهون");
    if(rand>0.4 && rand<0.6) aiResults[z].problem.push("اسمرار");
  });
  // إظهار الأسئلة بعد الفحص
  document.getElementById('questions').style.display='block';
  alert("تم الفحص الآلي، يرجى الإجابة على الأسئلة لتحديث التحليل النهائي.");
}

// ============================
// جمع إجابات العميل بعد الأسئلة
// ============================
function submitQuestions(){
  const form=document.getElementById('clientForm');
  clientData.skinType=form.skinType.value;
  clientData.pigmentation=form.pigmentation.value;
  clientData.acne=form.acne.value;
  clientData.acneTypes=[...form.acneType].filter(c=>c.checked).map(c=>c.value);
  clientData.darkCircles=form.darkCircles.value;
  clientData.dullness=form.dullness.value;
  clientData.sensitivity=form.sensitivity.value;

  displayResultsFinal();
}

// ============================
// دمج النتائج وعرض الروتين النهائي
// ============================
function displayResultsFinal(){
  const zonesData=JSON.parse(JSON.stringify(aiResults)); // نسخ النتائج
  // دمج أسئلة العميل
  if(clientData.pigmentation==="نعم"){ faceZones.forEach(z=>zonesData[z].problem.push("تصبغات")); }
  if(clientData.acne==="نعم"){ 
    faceZones.forEach(z=>{
      if(clientData.acneTypes.length>0) zonesData[z].problem.push(...clientData.acneTypes.map(t=> "حبوب-"+t));
      else zonesData[z].problem.push("حبوب");
    });
  }
  if(clientData.darkCircles==="نعم") zonesData["حول العين"].problem.push("هالات");
  if(clientData.dullness==="نعم") faceZones.forEach(z=>zonesData[z].problem.push("بهتان"));

  // عرض النتائج
  const faceMap=document.getElementById('faceMap');
  faceMap.innerHTML=""; faceMap.style.display="block";
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
      const color=zoneColors[prob.split("-")[0]] || "gray";
      div.style.backgroundColor=color;
      faceMap.appendChild(div);
    });
  });

  // اختيار روتين
  let selectedRoutine="متوسط";
  const r=routines[selectedRoutine];
  const filteredActive=r.active.filter(a=>clientData.sensitivity!=="نعم" || !["Retinol","Cretin"].includes(a));

  let html=`<h3>نوع البشرة العام: ${clientData.skinType}</h3>`;
  html+=`<p><strong>المشاكل حسب المنطقة:</strong></p>`;
  faceZones.forEach(z=>{
    html+=`<p><strong>${z}:</strong> ${zonesData[z].problem.length>0?zonesData[z].problem.join(", "):"لا توجد مشاكل واضحة"}</p>`;
  });
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
  analysisDiv.innerHTML=html; analysisDiv.style.display='block';
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
