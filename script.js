const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cursor = document.getElementById('cursor');
const cursor2 = document.getElementById('cursor2');
const target = document.getElementById('click-target');
let clicked = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(results => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    for (let i = 0; i < results.multiHandLandmarks.length; i++) {
      const landmarks = results.multiHandLandmarks[i];

      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
      drawLandmarks(ctx, landmarks, { color: '#FF0000', radius: 6 });

      const index = landmarks[8];
      const thumb = landmarks[4];

      const x = index.x * window.innerWidth;
      const y = index.y * window.innerHeight;

      if (i === 0) {
        // Tangan pertama = kontrol utama dan klik
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;

        const dx = index.x - thumb.x;
        const dy = index.y - thumb.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.05 && !clicked) {
          clicked = true;

          const rect = target.getBoundingClientRect();
          if (
            x >= rect.left && x <= rect.right &&
            y >= rect.top && y <= rect.bottom
          ) {
            target.innerText = "✅ Berhasil!";
            target.style.background = "green";
          }
        } else if (distance >= 0.05) {
          clicked = false;
        }
      } else if (i === 1) {
        // Tangan kedua = cursor2
        cursor2.style.left = `${x}px`;
        cursor2.style.top = `${y}px`;
      }
    }
  }
});

const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start();
