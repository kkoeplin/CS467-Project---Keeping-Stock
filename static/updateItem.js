// Source: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML

export function handleUpdateButton(item, modal, boxes) {
    const editButton = modal.querySelector("#item-modal-edit-btn");

    editButton.onclick = () => {
        const boxOptions = boxes.map(b => {
            const selected = b._id === item.box_id ? "selected" : "";
            return `<option value="${b._id}" ${selected}>${b.description}</option>`;
        }).join("");

        modal.innerHTML = `
        <div class="item-modal-edit">
            <h2>Edit Item</h2>
            <p>Change the item description or location where the item is stored</p>
            <form id="item-update-form" class="item-update-form">
                <div class="form-group">
                    <label for="description"><strong>Description of Item:</strong></label>
                    <input type="text" id="description" name="description" value="${item.description}" required>
                </div>

                <div class="form-group">
                    <label for="box_id"><strong>Box or Storage Space:</strong></label>
                    <select id="box_id" name="box_id">
                        ${boxOptions}
                    </select>
                </div>

                <div class="form-actions">
                    <button type="submit">Save</button>
                    <button type="button" id="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
        `;

        // Cancel button
        modal.querySelector("#cancel-btn").onclick = () => {
            window.showItemModal({ dataset: { item: JSON.stringify(item) } });
        };

        // Submit the form and give feedback
        modal.querySelector("#item-update-form").onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const description = formData.get("description");
            const box_id = formData.get("box_id");

            if (!description || !description.trim()) {
                alert("Description cant be empty");
                return;
            }

            try {
                const response = await fetch(`/gallery/items/${item._id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ description, box_id })
                });
                const result = await response.json();

                if (result.status) {
                    alert("Item updated");
                    location.reload();
                } else {
                    alert("Update failed");
                }
            } catch (err) {
                console.error(err);
                alert("Error updating the item");
            }
        };
    };
}
