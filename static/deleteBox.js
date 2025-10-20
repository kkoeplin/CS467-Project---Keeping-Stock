// referenced: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch - 10/19/25
document.addEventListener("DOMContentLoaded", () => {
  console.log("deleteBox.js loaded");

  const deleteButtons = document.querySelectorAll(".box-delete-btn");
  const boxResult = document.getElementById("boxResult");

  deleteButtons.forEach((button) => {
    console.log("button working", button);
    button.onclick = async () => {
      const boxId = button.dataset.boxId;
      const result = await fetch(`${window.location.origin}/boxes/delete/${boxId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await result.json();

      if (data.status) {
        const box = button.closest(".box-entry");
        if (box) {
          box.remove();
        }

        if (boxResult) {
          boxResult.style.display = "block";
          boxResult.textContent = "Box was deleted";
        }
      } else {
        alert("Error: " + data.error);
      }
    };
  });
});


