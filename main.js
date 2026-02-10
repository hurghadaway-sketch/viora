async function startScan() {
  document.getElementById("screen-start").classList.add("hidden");
  document.getElementById("screen-scan").classList.remove("hidden");

  const video = document.getElementById("camera");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    video.srcObject = stream;
    video.muted = true;
    await video.play();

    document.getElementById("scanSound").play();

    // اسكان وهمي 5 ثواني
    setTimeout(() => {
      stopCamera();
      alert("تم الاسكان بنجاح");
      location.reload();
    }, 5000);

  } catch (e) {
    alert("فشل فتح الكاميرا");
    console.error(e);
  }
}

function stopCamera() {
  const video = document.getElementById("camera");
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

