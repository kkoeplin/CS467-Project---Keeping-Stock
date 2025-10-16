let cameraStarted = false;
let mediaStream = null;

const video = document.getElementById('cameraFeed');
const cameraContainer = document.getElementById('cameraContainer');
const cameraControls = document.getElementById('cameraControls');
const mainButtons = document.querySelectorAll('#mainButtons button');

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            mediaStream = stream;
            video.srcObject = stream;
            cameraContainer.style.display = 'block';
            cameraStarted = true;

            // Disable main buttons while camera is active
            mainButtons.forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = 0.5;
            });

            // Clear previous mode buttons
            cameraControls.querySelectorAll('.mode-btn').forEach(btn => btn.remove());

            // Always show Exit button
            addExitButton();

            // Wait until video has loaded metadata to get proper width/height
            video.onloadedmetadata = () => {
                video.play();  // ensure video is playing
                scanQRCode();
            };
        })
        .catch(err => {
            alert('Error accessing camera. Please allow camera permission.\n\n' + err.message);
        });
}

function stopCamera() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
    cameraContainer.style.display = 'none';
    cameraStarted = false;

    // Re-enable main buttons
    mainButtons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = 1;
    });

    // Remove mode buttons
    cameraControls.querySelectorAll('.mode-btn').forEach(btn => btn.remove());
}

function addExitButton() {
    if (cameraControls.querySelector('.exit-btn')) return; // avoid duplicates

    const exitBtn = document.createElement('button');
    exitBtn.textContent = 'Exit Camera';
    exitBtn.className = 'take-image-btn exit-btn mode-btn';
    exitBtn.style.backgroundColor = 'red';
    exitBtn.style.color = 'white';
    exitBtn.addEventListener('click', stopCamera);
    cameraControls.appendChild(exitBtn);
}

// QR Code scanning using jsQR
function scanQRCode() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Tracking last detections to avoid false positives
    let lastDetectedCode = null;
    let detectionCount = 0;
    const REQUIRED_CONFIRMATIONS = 10; // number of frames required to confirm a code

    function tick() {
        if (!cameraStarted) return;

        // Only process if video has valid dimensions
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            requestAnimationFrame(tick);
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
            const detectedValue = code.data.trim();

            if (detectedValue === lastDetectedCode) {
                detectionCount++;
            } else {
                lastDetectedCode = detectedValue;
                detectionCount = 1;
            }

            if (detectionCount >= REQUIRED_CONFIRMATIONS) {
                alert('QR Code detected: ' + detectedValue);
                stopCamera();
                window.location.href = `gallery/filter?search=&box=${encodeURIComponent(detectedValue)}`;
                return;
            }
        } else {
            // Reset if no code in this frame
            lastDetectedCode = null;
            detectionCount = 0;
        }

        requestAnimationFrame(tick);
    }

    tick();
}

// Attach event listener
document.addEventListener('DOMContentLoaded', () => {
    const scanQrBtn = document.getElementById('scanQrBtn');
    scanQrBtn.addEventListener('click', startCamera);
});
