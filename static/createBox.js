const boxForm = document.getElementById("boxForm");
const boxDescription = document.getElementById("boxDescription");
const boxDescDisplay = document.getElementById("boxDesc");
const boxResult = document.getElementById("boxResult");
// const qr = document.getElementById("QR");

boxForm.onsubmit = async (e) => {
    e.preventDefault();

    const description = boxDescription.value.trim(); // catch spaces
    console.log(description);
    if (!description) {
        alert("Enter a box description.");
        return;
    }

// Send request to the backend to create a new box
    const res = await fetch('/boxes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description})
    });
    const data = await res.json(); 

    // Preview of box created with QR code
    if (data.status) {
        boxResult.style.display = "block";
        boxDescDisplay.textContent = `${data.description} (Box ID: ${data.box_id})`;
    } else {
        alert('Error: ' + data.error);
    }
};