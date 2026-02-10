// روتينات البشرة
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

// مناطق الوجه
const faceZones = ["الجبهة","الأنف","الذقن","الخد الأيمن","الخد الأيسر","حول العين"];
const zoneColors = {"جفاف":"blue","دهون":"red","تصبغات":"yellow","حبوب":"orange","هالات":"purple","بهتان":"gray","اسمرار":"brown"};

// تحليل الصورة
function analyzeImage() {
  const file = document.getElementById('faceImage').files[0];
  if(!file){ alert("اختر صورة أولاً"); return; }
  const img = new Image();
  const reader = new FileReader();
  reader.onload = function(e){ img.src = e.target.result; }
  reader.readAsDataURL(file);
  img.onload = function(){ processFaceImage(img); }
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
  img.onload=function(){ processFaceImage(img); }
}

// معالجة الوجه + تحليل المشاكل
function processFaceImage(img){
  const canvas=document.getElementById('canvas');
  const ctx=canvas.getContext('2d');
  canvas.width=300; canvas.height=300;
  ctx.drawImage(img,0,0,300,300);
  const data=ctx.getImageData(0,0,300,300).data;

  const zonesData={};
  faceZones.forEach(z=>zonesData[z]={brightness:0,dark:0,count:0,problem:[]});

  for(let y=0;y<300;y++){
    for(let x=0;x<300;x++){
      const i=(y*300+x)*4;
      const r=data[i], g=data[i+1], b=data[i+2];
      const br=(r+g+b)/3;
      let zone="";
      if(y<90) zone="الجبهة";
      else if(y>=90 && y<150){
        if(x<100) zone="الخد الأيسر";
        else if(x>200) zone="الخد الأيمن";
        else zone="الأنف";
      } else if(y>=150 && y<200) zone="حول العين";
      else zone="الذقن";

      zonesData[zone].brightness+=br;
      if(br<60) zonesData[zone].dark++;
      zonesData[zone].count++;
    }
  }

  // تقييم المناطق
  faceZones.forEach(z=>{
    const avgB=zonesData[z].brightness/zonesData[z].count;
    const darkPercent=Math.round(zonesData[z].dark/zonesData[z].count*100);

    if(avgB<120) zonesData[z].problem.push("جفاف");
    if(avgB>200) zonesData[z].problem.push("دهون");
    if(darkPercent>5) zonesData[z].problem.push("تصبغات");
    if(z==="حول العين" && darkPercent>10) zonesData[z].problem.push("هالات");
    if(avgB>50 && avgB<90) zonesData[z].problem.push("بهتان");
    if(avgB>30 && avgB<50) zonesData[z].problem.push("اسمرار");
    if(Math.random()<0.05) zonesData[z].problem.push("حبوب"); // محاكاة بسيطة
  });

  const overallAvg=faceZones.reduce((sum,z)=>sum+zonesData[z].brightness/zonesData[z].count,0)/faceZones.length;
  let skinType="عادية";
  if(overallAvg<100) skinType="جافة";
  else if(overallAvg>180) skinType="دهنية";
  else skinType="مختلطة";

  displayResults(skinType,zonesData);
}

// عرض النتائج + الروتين
function displayResults(skinType,zonesData){
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

  let html=`<h3>نوع البشرة العام: ${skinType}</h3>`;
  html+=`<p><strong>المشاكل حسب المنطقة:</strong></p>`;
  faceZones.forEach(z=>{
    html+=`<p><strong>${z}:</strong> ${zonesData[z].problem.length>0?zonesData[z].problem.join(", "):"لا توجد مشاكل واضحة"}</p>`;
  });

  html+=`<h3>الروتين المقترح</h3>`;
  const selectedRoutine="متوسط"; // مثال اختيار حسب التحليل
  const r=routines[selectedRoutine];
  html+=`<div class="routine"><h4>${selectedRoutine} - ${r.description}</h4>`;
  html+=`<p><strong>المواد الفعالة:</strong> ${r.active.join(", ")}</p>`;
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

// إرسال الروتين إلى واتساب
function sendWhatsApp(){
  const analysisDiv=document.getElementById('analysis');
  const text = encodeURIComponent(analysisDiv.innerText);
  const url = `https://wa.me/201063994139?text=${text}`;
  window.open(url,"_blank");
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
  img.onload=function(){ processFaceImage(img); }
}

// معالجة الوجه وتقسيم المناطق + خريطة تفاعلية
function processFaceImage(img){
  const canvas=document.getElementById('canvas');
  const ctx=canvas.getContext('2d');
  canvas.width=300; canvas.height=300;
  ctx.drawImage(img,0,0,300,300);

  const data=ctx.getImageData(0,0,300,300).data;

  const zonesData={};
  faceZones.forEach(z=>zonesData[z]={brightness:0,dark:0,count:0,problem:null});

  for(let y=0;y<300;y++){
    for(let x=0;x<300;x++){
      const i=(y*300+x)*4;
      const r=data[i], g=data[i+1], b=data[i+2];
      const br=(r+g+b)/3;

      let zone="";
      if(y<90) zone="الجبهة";
      else if(y>=90 && y<150){
        if(x<100) zone="الخد الأيسر";
        else if(x>200) zone="الخد الأيمن";
        else zone="الأنف";
      } else zone="الذقن";

      zonesData[zone].brightness+=br;
      if(br<60) zonesData[zone].dark++;
      zonesData[zone].count++;
    }
  }

  // تقييم المناطق
  faceZones.forEach(z=>{
    const avgB=zonesData[z].brightness/zonesData[z].count;
    const darkPercent=Math.round(zonesData[z].dark/zonesData[z].count*100);
    if(avgB<120) zonesData[z].problem="جفاف";
    else if(avgB>200) zonesData[z].problem="دهون";
    else if(darkPercent>5) zonesData[z].problem="تصبغات";
    else zonesData[z].problem=null;
  });

  const overallAvg=faceZones.reduce((sum,z)=>sum+zonesData[z].brightness/zonesData[z].count,0)/faceZones.length;
  let skinType="عادية";
  if(overallAvg<100) skinType="جافة";
  else if(overallAvg>180) skinType="دهنية";
  else skinType="مختلطة";

  displayInteractiveMap(skinType,zonesData);
}

// عرض الخريطة التفاعلية + النتائج
function displayInteractiveMap(skinType,zonesData){
  const faceMap=document.getElementById('faceMap');
  faceMap.innerHTML="";
  faceMap.style.display="block";

  const zoneCoords={
    "الجبهة":[100,20,100],
    "الأنف":[130,120,40],
    "الذقن":[120,220,80],
    "الخد الأيمن":[220,120,50],
    "الخد الأيسر":[60,120,50]
  };

  faceZones.forEach(z=>{
    if(zonesData[z].problem){
      const div=document.createElement('div');
      div.className="zone";
      div.style.left=(zoneCoords[z][0]-zoneCoords[z][2]/2)+"px";
      div.style.top=(zoneCoords[z][1]-zoneCoords[z][2]/2)+"px";
      div.style.width=zoneCoords[z][2]+"px";
      div.style.height=zoneCoords[z][2]+"px";
      div.style.backgroundColor=zoneColors[zonesData[z].problem];
      faceMap.appendChild(div);
    }
  });

  // عرض النتائج والروتينات
  let html=`<h3>نوع البشرة العام: ${skinType}</h3>`;
  html+=`<p><strong>المشاكل حسب المنطقة:</strong></p>`;
  faceZones.forEach(z=>{
    html+=`<p><strong>${z}:</strong> ${zonesData[z].problem?zonesData[z].problem:"لا توجد مشاكل واضحة"}</p>`;
  });

  html+=`<h3>الروتينات المقترحة</h3>`;
  Object.keys(routines).forEach(key=>{
    const r=routines[key];
    html+=`<div class="routine"><h4>${key} - ${r.description}</h4>`;
    html+=`<p><strong>المواد الفعالة:</strong> ${r.active.join(", ")}</p>`;
    html+=`<p><strong>مدة الروتين:</strong> ${r.duration}</p>`;
    html+=`<p><strong>مراحل الروتين:</strong></p><ul>`;
    Object.keys(r.stages).forEach(stage=>{
      html+=`<li><strong>${stage}:</strong> ${r.stages[stage]}</li>`;
    });
    html+=`</ul></div>`;
  });

  const analysisDiv=document.getElementById('analysis');
  analysisDiv.innerHTML=html;
  analysisDiv.style.display='block';
}
