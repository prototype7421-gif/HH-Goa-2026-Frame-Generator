document.addEventListener('DOMContentLoaded', () => {
  let currentFormat = 'A';
  let userImage = null;

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
  
  const btnFormatA = document.getElementById('btnFormatA');
  const btnFormatB = document.getElementById('btnFormatB');
  const formatBFields = document.getElementById('formatBFields');
  
  const imageInput = document.getElementById('imageInput');
  const uploadLabel = document.getElementById('uploadLabel');
  const loadingIndicator = document.getElementById('loadingIndicator');
  
  const inputName = document.getElementById('inputName');
  const inputRole = document.getElementById('inputRole');
  const inputTitle = document.getElementById('inputTitle');
  const btnRandomize = document.getElementById('btnRandomize');
  
  const btnDownload = document.getElementById('btnDownload');
  const btnShare = document.getElementById('btnShare');

  createPlaceholderImage();

  btnFormatA.addEventListener('click', () => setFormat('A'));
  btnFormatB.addEventListener('click', () => setFormat('B'));
  imageInput.addEventListener('change', handleImageUpload);
  inputName.addEventListener('input', renderGraphic);
  inputRole.addEventListener('input', renderGraphic);
  inputTitle.addEventListener('input', renderGraphic);
  btnRandomize.addEventListener('click', generateRandomTitle);
  btnDownload.addEventListener('click', downloadImage);
  btnShare.addEventListener('click', shareToX);

  function setFormat(format) {
    currentFormat = format;
    const activeClass = "py-2.5 px-4 text-sm font-bold rounded-xl border-2 border-yellow-400 bg-yellow-400 text-slate-950 transition-all shadow-lg shadow-yellow-400/20";
    const inactiveClass = "py-2.5 px-4 text-sm font-semibold rounded-xl border border-emerald-800 bg-emerald-950/60 text-emerald-300 hover:text-white transition-all";

    if (format === 'A') {
      btnFormatA.className = activeClass;
      btnFormatB.className = inactiveClass;
      formatBFields.classList.add('hidden');
    } else {
      btnFormatB.className = activeClass;
      btnFormatA.className = inactiveClass;
      formatBFields.classList.remove('hidden');
    }
    renderGraphic();
  }

  function generateRandomTitle() {
    inputTitle.value = titles[Math.floor(Math.random() * titles.length)];
    renderGraphic();
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    loadingIndicator.classList.remove('hidden');
    uploadLabel.innerText = file.name;

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
        const img = new Image();
        img.onload = () => {
          userImage = img;
          loadingIndicator.classList.add('hidden');
          renderGraphic();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      alert('Error processing image file. Please upload a standard JPG or PNG.');
      loadingIndicator.classList.add('hidden');
      uploadLabel.innerText = 'Click to browse or drag photo';
    }
  }

  function createPlaceholderImage() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 400;
    pCanvas.height = 400;
    const pCtx = pCanvas.getContext('2d');
    pCtx.fillStyle = '#0b3b2c';
    pCtx.fillRect(0, 0, 400, 400);
    pCtx.fillStyle = '#facc15';
    pCtx.font = 'bold 20px "Space Grotesk", sans-serif';
    pCtx.textAlign = 'center';
    pCtx.fillText('Photo Preview', 200, 205);

    const img = new Image();
    img.onload = () => {
      userImage = img;
      renderGraphic();
    };
    img.src = pCanvas.toDataURL();
  }

  function renderGraphic() {
    if (!userImage) return;
    currentFormat === 'A' ? renderFormatA() : renderFormatB();
  }

  // Format A: Official Green & Sunshine Yellow PFP Frame
  function renderFormatA() {
    const size = 1080;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    drawImageCover(userImage, 0, 0, size, size);

    // Sunshine Yellow Border Frame
    const borderWidth = 40;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth / 2, borderWidth / 2, size - borderWidth, size - borderWidth);

    // Bottom Branding Pill (Deep Forest Green with Yellow Text)
    const padding = 50;
    const boxWidth = 380;
    const boxHeight = 90;
    
    ctx.fillStyle = '#0b3b2c';
    ctx.fillRect(size - boxWidth - padding, size - boxHeight - padding, boxWidth, boxHeight);
    
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.strokeRect(size - boxWidth - padding, size - boxHeight - padding, boxWidth, boxHeight);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('HH GOA 2026', size - (boxWidth / 2) - padding, size - (boxHeight / 2) - padding);
  }

  // Format B: Official Builder ID Pass
  function renderFormatB() {
    const width = 800;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;

    // Rich Forest Green Card Background
    ctx.fillStyle = '#0b3b2c';
    ctx.fillRect(0, 0, width, height);

    // Top Header Banner with Sunshine Yellow Accent
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, width, 16);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 64px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HH GOA 2026', width / 2, 110);
    
    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 22px "Space Grotesk", sans-serif';
    ctx.fillText('OFFICIAL BUILDER PASS', width / 2, 150);

    const photoSize = 420;
    const photoX = (width - photoSize) / 2;
    const photoY = 220;

    ctx.fillStyle = '#064e3b';
    ctx.fillRect(photoX, photoY, photoSize, photoSize);
    drawImageCover(userImage, photoX, photoY, photoSize, photoSize);

    // Sunshine Yellow Photo Border
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 6;
    ctx.strokeRect(photoX, photoY, photoSize, photoSize);

    const name = inputName.value || 'Builder Name';
    const role = inputRole.value || 'Stack / Role';
    const title = inputTitle.value || 'Goa Beach Hacker';

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, width / 2, 730);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 26px "Space Grotesk", sans-serif';
    ctx.fillText(role.toUpperCase(), width / 2, 780);

    // Card Details Box
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(80, 840, width - 160, 110);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 840, width - 160, 110);

    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 16px "Space Grotesk", sans-serif';
    ctx.fillText('DESIGNATED TITLE', width / 2, 875);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px "Space Grotesk", sans-serif';
    ctx.fillText(title, width / 2, 920);

    // Footer Bar
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, height - 90, width, 90);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('#FrameInGoa', width / 2, height - 42);
  }

  function drawImageCover(img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;
    let sw, sh, sx, sy;

    if (imgRatio > targetRatio) {
      sh = img.height;
      sw = img.height * targetRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = img.width / targetRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  function downloadImage() {
    if (!userImage) return;
    const link = document.createElement('a');
    link.download = `HH_Goa_2026_${currentFormat === 'A' ? 'PFP' : 'Badge'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function shareToX() {
    const tweetText = encodeURIComponent("Just generated my official HH Goa 2026 badge. See you at the beach! 🌴⚡ #FrameInGoa");
    window.open(`https://x.com/intent/tweet?text=${tweetText}`, '_blank');
  }
});