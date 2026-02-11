let user = {
  name: "",
  imageData: null,
  scan: {},
  answers: {},
  routine: ""
};

const questions = [
  { q:"هل بشرتك تتحسس بسرعة؟", a:["نعم","لا"], key:"sensitive" },
  { q:"درجة التصبغات؟", a:["خفيفة","متوسطة","عنيدة"], key:"pigmentation" },
  { q:"هل توجد حبوب نشطة؟", a:["لا","بسيطة","ملتهبة"], key:"acne" }
];

let qIndex = 0;

function show(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goToScan(){
  const n=document.getElementById("username").value.trim();
  if(!n){ alert("ادخل الاسم"); return }
  user.name=n;
  show("scan");
}

document.getElementById("imageInput").onchange=e=>{
  const img=document.getElementById("preview");
  img.src=URL.createObjectURL(e.target.files[0]);
}

function analyzeImage(){
  const img=document.getElementById("preview");
  if(!img.src){ alert("ارفع صورة"); return }

  const canvas=document.getElementById("canvas");
  const ctx=canvas.getContext("2d");
  canvas.width=img.naturalWidth;
  canvas.height=img.naturalHeight;
  ctx.drawImage(img,0,0);

  const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let brightness=0, contrast=0;

  for(let i=0;i<data.length;i+=4){
    const avg=(data[i]+data[i+1]+data[i+2])/3;
    brightness+=avg;
    contrast+=Math.abs(avg-128);
  }

  brightness/=data.length/4;
  contrast/=data.length/4;

  user.scan = {
    oily: brightness>150,
    dull: brightness<110,
    pigmentation: contrast>50
  };

  document.getElementById("scanResult").innerHTML =
   `🔍 نتائج أولية:<br>
    ${user.scan.oily?"لمعان زائد<br>":""}
    ${user.scan.dull?"بهتان<br>":""}
    ${user.scan.pigmentation?"تفاوت لون<br>":""}`;

  show("questions");
  loadQ();
}

function loadQ(){
  const q=questions[qIndex];
  document.getElementById("qTitle").innerText=q.q;
  const box=document.getElementById("qAnswers");
  box.innerHTML="";
  q.a.forEach(ans=>{
    const b=document.createElement("button");
    b.innerText=ans;
    b.onclick=()=>{
      user.answers[q.key]=ans;
      qIndex++;
      qIndex<questions.length ? loadQ() : finish();
    };
    box.appendChild(b);
  });
}

function finish(){
  let txt=`👤 ${user.name}<br>مشكلات:<br>`;
  if(user.scan.oily) txt+="• دهون زائدة<br>";
  if(user.scan.pigmentation) txt+="• تصبغات<br>";
  if(user.answers.acne!=="لا") txt+="• حبوب<br>";

  user.routine = (user.answers.sensitive==="نعم")
    ? "روتين محافظ"
    : "روتين أسرع بنتائج أعلى";

  txt+=`<br><b>${user.routine}</b>`;
  document.getElementById("analysis").innerHTML=txt;
  show("result");
}

function showRoutine(){
  const r = `
  <h3>${user.routine}</h3>

  <b>المرحلة 1 – ترطيب</b><br>
  Hyaluronic Acid + Panthenol<br>
  Nano Treat HA & V.C<br><br>

  <b>المرحلة 2 – علاج</b><br>
  Niacinamide / Adapalene<br>
  Kolagra Whitening / Acretin<br><br>

  <b>المرحلة 3 – صيانة</b><br>
  Vitamin C + Sunscreen<br>
  Infinity SPF50+
  `;
  document.getElementById("routineBox").innerHTML=r;
  show("routine");
}

function sendWhats(){
  const msg = `
VIORA REPORT
Name: ${user.name}
Routine: ${user.routine}
Problems:
${JSON.stringify(user.scan)}
  `;
  window.open(
    "https://wa.me/201063994139?text="+encodeURIComponent(msg),
    "_blank"
  );
}
