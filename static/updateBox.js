// Reference: https://www.slingacademy.com/article/from-static-to-dynamic-updating-the-dom-in-real-time-with-javascript/
document.addEventListener("DOMContentLoaded", () => {
  console.log("UpdateBox.js loaded");

  const updateButtons = document.querySelectorAll(".box-update-btn");
  const boxResult = document.getElementById("boxResult");


  updateButtons.forEach((button) => {
    console.log("button work ", button);

    button.onclick = async () => {
        const boxRow = button.closest(".box-entry");
        const boxId = button.dataset.boxId;

        const currentDesc = boxRow.querySelector(".box-description").textContent.trim();
        const newDescription = prompt("Enter a new description", currentDesc);

        // Check the description
      if (!newDescription || !newDescription.trim()) {
        if (boxResult) {
          boxResult.style.display = "block";
          boxResult.textContent = "Error: Description can't be empty or spaces only.";
        }
        return;
    }

      const result = await fetch(`${window.location.origin}/boxes/update/${boxId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: newDescription.trim() }),
      });

      const data = await result.json();

      if (data.status) {
        const box = button.closest(".box-entry");
        if (box) {
            const desc = box.querySelector(".box-description");
            if (desc) desc.textContent = newDescription.trim(); // whitespace
        }

        if (boxResult) {
          boxResult.style.display = "block";
          boxResult.textContent = "Box was updated successfully";
        }
        console.log("Box updated:", boxId);

      } else {
        if (boxResult) {
          boxResult.style.display = "block";
          boxResult.textContent = "Error: " + data.error;
        }
      }
    };
  });
});


