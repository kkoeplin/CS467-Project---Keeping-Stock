

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.box-generate-qr-btn').forEach(button => {
        button.addEventListener('click', () => {
            const boxId = button.getAttribute('data-box-id');
            downloadQR(boxId);
        });
    });
});

function downloadQR(boxId) {
    fetch(`/boxes/${boxId}/generate_qr`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => { throw new Error(data.message) });
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `box_${boxId}_qr.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            alert(`QR code for box ID: ${boxId} download has started!`);
        })
        .catch(err => {
            alert(`❌ ${err.message}`);
        });
}

