

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.box-generate-qr-btn').forEach(button => {
        button.addEventListener('click', () => {
            const boxId = button.getAttribute('data-box-id');
            window.location.href = `/boxes/${boxId}/generate_qr`;
        });
    });
});
