document.addEventListener('DOMContentLoaded', () => {
  let userImage = null;

  let cropScale = 1, minCropScale = 1;
  let cropX = 0, cropY = 0;
  let isDragging = false;
  let dragStartX, dragStartY;

  const titles = [
    "Goa Beach Hacker",
    "Protocol Architect",
    "Tropical Fullstack Dev",
    "Smart Contract Wizard",
    "UI/UX Surf Rider",
    "Vibe Coder Extraordinaire"
  ];

  const canvas = document.getElementById('previewCanvas');
  const ctx = canvas.getContext('2d');
  
  const stepUpload = document.getElementById('step-upload');
  const stepCrop = document.getElementById('step-crop');
  const stepDetails = document.getElementById('step-details');
  
  const imageInput = document.getElementById('imageInput');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const cropContainer = document.getElementById('cropContainer');
  const cropImage = document.getElementById('cropImage');
  const zoomSlider = document.getElementById('zoomSlider');
  const btnConfirmCrop = document.getElementById('btnConfirmCrop');

  const inputName = document.getElementById('inputName');
  const inputRole = document.getElementById('inputRole');
  const inputTitle = document.getElementById('inputTitle');
  const btnRandomize = document.getElementById('btnRandomize');
  const btnDownload = document.getElementById('btnDownload');
  const btnShare = document.getElementById('btnShare');
  const btnReset = document.getElementById('btnReset');

  // Start the Live Countdown logic
  initCountdown();

  // STEP 1: UPLOAD LOGIC
  imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    loadingIndicator.classList.remove('hidden');

    try {
      let blob = file;
      if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
        if (typeof heic2any !== 'undefined') {
          const convertedBlobs = await heic2any({ blob: file, toType: 'image/jpeg' });
          blob = Array.isArray(convertedBlobs) ? convertedBlobs[0] : convertedBlobs;
        }
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        cropImage.src = event.target.result;
        cropImage.onload = () => {
          loadingIndicator.classList.add('hidden');
          initCropper();
        };
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      alert('Error processing image file. Please upload a standard JPG or PNG.');
      loadingIndicator.classList.add('hidden');
    }
  });

  // STEP 2: CROPPER LOGIC
  function initCropper() {
    stepUpload.classList.add('hidden');
    stepCrop.classList.remove('hidden');

    const cw = cropContainer.clientWidth;
    const ch = cropContainer.clientHeight;
    
    minCropScale = Math.max(cw / cropImage.naturalWidth, ch / cropImage.naturalHeight);
    cropScale = minCropScale;
    
    zoomSlider.min = minCropScale;
    zoomSlider.max = minCropScale * 3;
    zoomSlider.value = cropScale;

    cropX = (cw - cropImage.naturalWidth * cropScale) / 2;
    cropY = (ch - cropImage.naturalHeight * cropScale) / 2;
    
    updateCropTransform();
  }

  function updateCropTransform() {
    cropImage.style.transform = `translate(${cropX}px, ${cropY}px) scale(${cropScale})`;
  }

  cropContainer.addEventListener('mousedown', e => { 
    isDragging = true; 
    dragStartX = e.clientX - cropX; 
    dragStartY = e.clientY - cropY; 
  });
  window.addEventListener('mousemove', e => { 
    if(!isDragging) return; 
    cropX = e.clientX - dragStartX; 
    cropY = e.clientY - dragStartY; 
    updateCropTransform(); 
  });
  window.addEventListener('mouseup', () => isDragging = false);

  cropContainer.addEventListener('touchstart', e => { 
    isDragging = true; 
    dragStartX = e.touches[0].clientX - cropX; 
    dragStartY = e.touches[0].clientY - cropY; 
  });
  window.addEventListener('touchmove', e => { 
    if(!isDragging) return; 
    cropX = e.touches[0].clientX - dragStartX; 
    cropY = e.touches[0].clientY - dragStartY; 
    updateCropTransform(); 
    e.preventDefault(); 
  }, { passive: false });
  window.addEventListener('touchend', () => isDragging = false);

  zoomSlider.addEventListener('input', e => {
    const oldScale = cropScale;
    cropScale = parseFloat(e.target.value);
    const cw = cropContainer.clientWidth / 2;
    const ch = cropContainer.clientHeight / 2;
    cropX = cw - (cw - cropX) * (cropScale / oldScale);
    cropY = ch - (ch - cropY) * (cropScale / oldScale);
    updateCropTransform();
  });

  btnConfirmCrop.addEventListener('click', () => {
    const offCanvas = document.createElement('canvas');
    const OUT_SIZE = 800; 
    offCanvas.width = OUT_SIZE;
    offCanvas.height = OUT_SIZE;
    const oCtx = offCanvas.getContext('2d');
    
    const ratio = OUT_SIZE / cropContainer.clientWidth;
    
    oCtx.drawImage(
      cropImage,
      cropX * ratio,
      cropY * ratio,
      cropImage.naturalWidth * cropScale * ratio,
      cropImage.naturalHeight * cropScale * ratio
    );

    const finalImg = new Image();
    finalImg.onload = () => {
      userImage = finalImg;
      stepCrop.classList.add('hidden');
      stepDetails.classList.remove('hidden');
      renderGraphic();
      updateButtonState();
    };
    finalImg.src = offCanvas.toDataURL('image/png');
  });

  // STEP 3: DETAILS & BUTTON EVENTS
  inputName.addEventListener('input', () => { renderGraphic(); updateButtonState(); });
  inputRole.addEventListener('input', () => { renderGraphic(); updateButtonState(); });
  inputTitle.addEventListener('input', () => { renderGraphic(); updateButtonState(); });
  
  btnRandomize.addEventListener('click', () => {
    inputTitle.value = titles[Math.floor(Math.random() * titles.length)];
    renderGraphic();
    updateButtonState();
  });
  
  btnDownload.addEventListener('click', downloadImage);
  btnShare.addEventListener('click', shareToX);

  // RESET LOGIC
  btnReset.addEventListener('click', () => {
    userImage = null;
    imageInput.value = '';
    inputName.value = '';
    inputRole.value = '';
    inputTitle.value = 'Goa Beach Hacker';
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    stepDetails.classList.add('hidden');
    stepCrop.classList.add('hidden');
    stepUpload.classList.remove('hidden');
    
    updateButtonState();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function updateButtonState() {
    const hasDetails = inputName.value.trim() !== '' && inputRole.value.trim() !== '';
    if (hasDetails) {
      btnDownload.disabled = false;
      btnShare.disabled = false;
      btnDownload.classList.remove('opacity-50', 'cursor-not-allowed');
      btnShare.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
      btnDownload.disabled = true;
      btnShare.disabled = true;
      btnDownload.classList.add('opacity-50', 'cursor-not-allowed');
      btnShare.classList.add('opacity-50', 'cursor-not-allowed');
    }
  }

  // =====================================
  // UPDATED: BEAUTIFUL CARD RENDERING
  // =====================================
  function renderGraphic() {
    if (!userImage) return;

    const width = 800;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;

    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#022c22'); 
    bgGrad.addColorStop(0.4, '#064e3b'); 
    bgGrad.addColorStop(1, '#022c22'); 
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, width - 30, height - 30);

    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.moveTo(0, 930);
    ctx.bezierCurveTo(200, 860, 600, 1000, width, 930);
    ctx.lineTo(width, height); ctx.lineTo(0, height); ctx.fill();

    ctx.fillStyle = '#022c22';
    ctx.beginPath();
    ctx.moveTo(0, 1000);
    ctx.bezierCurveTo(300, 1060, 500, 930, width, 1000);
    ctx.lineTo(width, height); ctx.lineTo(0, height); ctx.fill();

    ctx.fillStyle = '#022c22';
    ctx.beginPath();
    ctx.roundRect(width/2 - 50, 40, 100, 20, 10);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.font = '900 64px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    ctx.fillText('HH GOA 2026', width / 2, 145);
    
    ctx.shadowBlur = 0; 
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    ctx.letterSpacing = "4px"; 
    ctx.fillText('OFFICIAL BUILDER PASS', width / 2, 190);

    const photoSize = 420;
    const photoX = (width - photoSize) / 2;
    const photoY = 230;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 15;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(photoX - 14, photoY - 14, photoSize + 28, photoSize + 28);
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.drawImage(userImage, photoX, photoY, photoSize, photoSize);

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.strokeRect(photoX - 14, photoY - 14, photoSize + 28, photoSize + 28);

    ctx.save();
    ctx.translate(630, 230);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.ellipse(40, -40, 100, 25, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#166534'; ctx.beginPath(); ctx.ellipse(70, 0, 90, 22, -Math.PI / 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#064e3b'; ctx.beginPath(); ctx.ellipse(10, -70, 70, 18, -Math.PI / 2.5, 0, Math.PI * 2); ctx.fill();
    
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#ca8a04'; ctx.beginPath(); ctx.arc(15, -15, 34, 0, Math.PI * 2); ctx.fill(); 
    ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.arc(-20, 15, 30, 0, Math.PI * 2); ctx.fill(); 
    ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(30, 20, 26, 0, Math.PI * 2); ctx.fill(); 
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#a16207';
    ctx.beginPath(); ctx.arc(5, -20, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(20, -15, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -5, 4, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(170, 670);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.ellipse(-50, 40, 70, 25, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#166534'; ctx.beginPath(); ctx.ellipse(-60, -10, 60, 20, Math.PI / 1.2, 0, Math.PI * 2); ctx.fill();
    
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#ec4899';
    for (let i = 0; i < 5; i++) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.beginPath(); ctx.ellipse(0, -30, 28, 45, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#be185d';
    for (let i = 0; i < 5; i++) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.beginPath(); ctx.ellipse(0, -15, 12, 25, 0, 0, Math.PI * 2); ctx.fill();
    }
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#facc15'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, -30); ctx.stroke();
    ctx.beginPath(); ctx.arc(-30, -30, 7, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(650, 660);
    ctx.rotate(Math.PI / 5);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#fb923c'; 
    for(let i=0; i<5; i++) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(8, -15);
      ctx.lineTo(0, -40);
      ctx.lineTo(-8, -15);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    const name = inputName.value.trim() || 'YOUR NAME';
    const role = inputRole.value.trim() || 'YOUR ROLE';
    const title = inputTitle.value.trim() || 'Goa Beach Hacker';

    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px "Space Grotesk", sans-serif';
    ctx.fillText(name, width / 2, 755, 720); 

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.letterSpacing = "2px";
    ctx.fillText(role.toUpperCase(), width / 2, 805, 720);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(100, 850, width - 200, 90, 20); 
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px "Space Grotesk", sans-serif';
    ctx.letterSpacing = "0px";
    ctx.textBaseline = 'middle'; 
    ctx.fillText(title, width / 2, 895, 560);
    ctx.textBaseline = 'alphabetic'; 

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 20px monospace';
    
    ctx.textAlign = 'left';
    ctx.fillText('GOA, INDIA · 28-31 OCT 2026', 80, 1025);
    
    ctx.textAlign = 'right';
    ctx.fillText('2:47 PM STUDIO', width - 80, 1025);

    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, height - 100, width, 100);
    
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 30px monospace';
    ctx.textAlign = 'center'; 
    ctx.textBaseline = 'middle';
    ctx.fillText('#FrameInGoa', width / 2, height - 50);
    ctx.textBaseline = 'alphabetic'; 
  }

  // =====================================
  // ACTIONS: CONFETTI & COUNTDOWN
  // =====================================

  function triggerConfetti() {
    if (typeof confetti === 'undefined') return;
    const colors = ['#facc15', '#ec4899', '#ffffff', '#15803d'];
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
      disableForReducedMotion: true
    });
  }

  function downloadImage() {
    if (!userImage) return;
    
    // Trigger confetti right before download!
    triggerConfetti();

    const link = document.createElement('a');
    const name = inputName.value.trim() || 'Hacker';
    link.download = `HH_Goa_2026_${name.replace(/\s+/g, '_')}_Badge.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function shareToX() {
    const tweetText = encodeURIComponent("Just generated my official HH Goa 2026 badge. See you at the beach! 🌴⚡ #FrameInGoa");
    window.open(`https://x.com/intent/tweet?text=${tweetText}`, '_blank');
  }

  function initCountdown() {
    const targetDate = new Date('October 28, 2026 09:00:00').getTime();
    
    const elements = {
      days: document.getElementById('countdownDays'),
      hours: document.getElementById('countdownHours'),
      mins: document.getElementById('countdownMinutes')
    };

    if (!elements.days) return;

    function update() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) return; // Event already started

      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      elements.days.innerText = String(d).padStart(2, '0');
      elements.hours.innerText = String(h).padStart(2, '0');
      elements.mins.innerText = String(m).padStart(2, '0');
    }

    update(); // Run immediately
    setInterval(update, 1000 * 60); // Update every minute
  }
});