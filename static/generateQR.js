

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".box-qr-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const boxId = btn.dataset.boxId;

            const qrUrl = `/boxes/${boxId}/generate_qr`;

            // Create a temporary link to download and open the QR
            const link = document.createElement("a");
            link.href = qrUrl;
            link.download = `box_${boxId}_qr.png`; // file name for download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Also open the QR in a new tab
            window.open(qrUrl, "_blank");
        });
    });
});
