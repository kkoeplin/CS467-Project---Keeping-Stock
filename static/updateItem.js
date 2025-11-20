// Source: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML

export function handleUpdateButton(item, modal, boxes) {
    const editButton = modal.querySelector("#item-modal-edit-btn");
    if (!editButton) return;

    editButton.onclick = () => {
        // Prevent multiple forms
        let formContainer = modal.querySelector(".item-modal-edit");
        if (formContainer) return; 

        formContainer = document.createElement("div");
        formContainer.className = "item-modal-edit";
        formContainer.style = "border: 2px solid #0c0c0cff; padding: 20px; margin-top: 10px; border-radius: 5px; background-color: #f5f5f5;";

        const boxOptions = boxes.map(b => `<option value="${b._id}" ${b._id === item.box_id ? "selected" : ""}>${b.description}</option>`).join("");

        formContainer.innerHTML = `
            <h2>Edit Item</h2>
            <form id="item-update-form">
                <div>
                    <label>Description</label>
                    <input type="text" name="description" value="${item.description}" required>
                </div>
                <div>
                    <label>Box</label>
                    <select name="box_id">${boxOptions}</select>
                </div>
                <div style="margin-top: 10px;">
                    <button type="submit">Save</button>
                    <button type="button" id="cancel-btn">Cancel</button>
                </div>
            </form>
        `;
        modal.appendChild(formContainer);

        // Cancel button
        formContainer.querySelector("#cancel-btn").onclick = () => {
            formContainer.remove();
        };

        // Submit
        formContainer.querySelector("#item-update-form").onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const description = formData.get("description").trim();
            const box_id = formData.get("box_id");

            if (!description) return alert("Description can't be empty");

            try {
                const res = await fetch(`/gallery/items/${item._id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ description, box_id })
                });
                const result = await res.json();

                if (result.status) {
                    // Update item object
                    item.description = description;
                    item.box_id = box_id;
                    const boxObj = boxes.find(b => b._id === box_id);
                    item.box = boxObj ? boxObj.description : item.box;

                    // Update modal display
                    modal.querySelector("h3").textContent = item.description;
                    modal.querySelector("p").textContent = `Box: ${item.box}`;

                    // Update gallery card
                    const card = document.getElementById(`item-card-${item._id}`);
                    if (card) {
                        card.querySelector(".item-description").textContent = item.description;
                        card.querySelector(".item-card-box").textContent = `Box: ${item.box}`;
                    }

                    formContainer.remove();
                    alert("Item updated!");
                } else {
                    alert(result.error || "Update failed");
                }
            } catch (err) {
                console.error(err);
                alert("Error updating item");
            }
        };
    };
}

