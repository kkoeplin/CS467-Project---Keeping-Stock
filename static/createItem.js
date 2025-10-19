const video = document.getElementById('cameraFeed');
const captureBtn = document.getElementById('captureBtn');
const exitBtn = document.getElementById('exitBtn');
const preview = document.getElementById('preview');
const imgTag = document.getElementById('capturedImage');
const descSpan = document.getElementById('desc');
const tagsSpan = document.getElementById('tags');
const saveBtn = document.getElementById('saveBtn');
let imageData = null;
let aiResult = null;

// start camera 
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
    console.log("Camera starts successfully")
});

// capture snapshot
captureBtn.onclick = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    imageData = canvas.toDataURL('image/png');
    imgTag.src = imageData;
    preview.style.display = 'block';
    
    console.log("Image capture. Sending to backend..")

    // call backend AI route
    const res = await fetch('/items/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
    });
    aiResult = await res.json();
    if (aiResult.success) {
        descSpan.textContent = aiResult.description;
        tagsSpan.textContent = aiResult.tags.join(', ');
    } else {
        descSpan.textContent = 'Failed to generate.';
    }
};

// save item to DB
saveBtn.onclick = async () => {
    if (!aiResult || !aiResult.success) return alert('Waiting for AI data...');
    const res = await fetch('/items/create', {      
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image: imageData,
            description: aiResult.description,
            tags: aiResult.tags
        })
    });
    const data = await res.json();
    if (data.success) alert('Item saved successfully!');
};

// exit camera
exitBtn.onclick = () => {
    video.srcObject.getTracks().forEach(t => t.stop());
    window.location.href = '/';
};
