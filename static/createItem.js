// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Manipulating_video_using_canvas
// https://daverupert.com/2022/11/html5-video-capture-frame-still
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL

document.addEventListener("DOMContentLoaded", ()=>{
    const video = document.getElementById('cameraFeed');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('backBtn'); 
    const saveBtn = document.getElementById('saveBtn');
    const preview = document.getElementById('preview');
    const capturedImg = document.getElementById('capturedImage');
    const descField = document.getElementById('desc');
    const tagsField = document.getElementById('tags');
    const spinner = document.getElementById('spinner');
    const boxSelect = document.getElementById('boxSelect');
    const removedFlag = document.getElementById('removedFlag');
    let imageData = null;
    let aiResult = null;
    let stream = null;

    // list of boxes for dropdown
    async function loadBoxes() {
        try {
            const res = await fetch('/boxes/api/view');
            const data = await res.json();
            console.log("data =>", data)

            if (data.success && Array.isArray(data.boxes)) {
                data.boxes.forEach(box => {
                    const opt = document.createElement('option');
                    opt.value = box._id;                     
                    opt.textContent = box.description || ''; 
                    boxSelect.appendChild(opt);
                }); 
            }
        } catch (err) {
            console.error("Error loading boxes:", err);
        }
    }
    loadBoxes();

    // Start camera
    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            console.log("Camera starts successfully");
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Unable to access camera. Please allow camera permissions.");
        }
    }

    startCamera();

    // Stop camera
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }

    // Capture snapshot and send for AI analysis
    captureBtn.onclick = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        imageData = canvas.toDataURL('image/png'); // convert to base64 encoded image string

        capturedImg.src = imageData;
        preview.hidden = false;
        video.style.display = 'none';      // hide camera
        captureBtn.style.display = 'none'; // hide capture button
        spinner.style.display = 'block';   // show spinner

        try {
            const res = await fetch('/items/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData })
            });

            aiResult = await res.json();

            if (aiResult.success) {
                descField.value = aiResult.description;
                tagsField.value = aiResult.tags.join(', ');
            } else {
                descField.value = 'Failed to generate description.';
                tagsField.value = '';
            }
        } catch (err) {
            console.error("Error during AI call:", err);
            descField.value = 'Error connecting to AI service.';
            tagsField.value = '';
        } finally {
            spinner.style.display = 'none';
        }
    };

    saveBtn.onclick = async () => {
        if (!imageData) return alert('No image captured yet.');
        const description = descField.value.trim();
        const tags = tagsField.value.split(',').map(t => t.trim()).filter(t => t);

        const res = await fetch('/items/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            image: imageData,
            description,
            tags,
            box_id: boxSelect.value,
            removed: 'No'
            })
        });

        const data = await res.json();
        if (data.success) {
            alert('Item saved successfully!');
            window.location.href = '/items';
        } else {
            alert('Failed to save item. Please try again.');
        }
    };

    // Retake button
    retakeBtn.onclick = async () => {
        // reset fields and show camera again when user click on retake
        preview.hidden = true;
        capturedImg.src = '';
        descField.value = '';
        tagsField.value = '';
        aiResult = null;

        video.style.display = 'block';
        captureBtn.style.display = 'inline-block';

        // Restart the camera
        stopCamera();
        await startCamera();
    };
});
