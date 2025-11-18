// Checkout item using flag
//Source: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement
//Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString

export function handleCheckoutButton(item, modal) {
    const checkoutBtn = modal.querySelector("#item-modal-checkout-btn");
    if (!checkoutBtn) return;

    checkoutBtn.onclick = () => {
        const today = new Date().toISOString().split("T")[0];

        // Inject only the checkout form, not the entire modal
        const formContainer = document.createElement("div");
        formContainer.className = "item-modal-checkout";
        formContainer.style = "border: 2px solid #0c0c0cff; padding: 20px; max-width: 400px; margin: auto; background-color: #ece5f5ff; border-radius: 5px;";
        formContainer.innerHTML = `
            <h2>Check Out Item</h2>
            <p>Enter your name and the checkout date:</p>
            <form id="item-checkout-form">
                <div class="form-group">
                    <label for="user"><strong>Your Name:</strong></label>
                    <input type="text" id="user" name="user" placeholder="Enter your name" required style="width: 100%; padding: 5px;">
                </div>
                <div class="form-group">
                    <label for="date"><strong>Date:</strong></label>
                    <input type="date" id="date" name="date" value="${today}" required style="width: 100%; padding: 8px;">
                </div>
                <div style="margin-top: 20px;">
                    <button type="submit" style="margin-right: 10px;">Check Out</button>
                    <button type="button" id="cancel-btn">Cancel</button>
                </div>
            </form>
        `;

        // Append the form to modal
        modal.appendChild(formContainer);

        // Cancel button
        formContainer.querySelector("#cancel-btn").onclick = () => {
            formContainer.remove(); // just remove the form
        };

        // Form submission
        formContainer.querySelector("#item-checkout-form").onsubmit = async (e) => {
            e.preventDefault();
            const user = formContainer.querySelector("#user").value.trim();
            const date = formContainer.querySelector("#date").value;

            if (!user) return alert("Enter your name");

            try {
                const res = await fetch("/items/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ item_ids: [item._id], user, date })
                });
                const data = await res.json();

                if (data.success) {
                    // Update item object
                    item.checked_out = true;
                    item.checked_out_by = user;
                    item.checkout_date = date;

                    // Update modal text
                    const info = modal.querySelector("#item-checked-out-info");
                    if (info) info.textContent = `Checked out by ${user} on ${date}`;

                    // Update buttons
                    checkoutBtn.hidden = true;
                    const checkinBtn = modal.querySelector("#item-modal-checkin-btn");
                    if (checkinBtn) checkinBtn.hidden = false;

                    // Update gallery card
                    const card = document.getElementById(`item-card-${item._id}`);
                    if (card) {
                        card.classList.add("checked-out");
                        const desc = card.querySelector(".item-description");
                        if (desc) desc.innerHTML = `
                            ${item.description}
                            <span style="color:rgb(141, 1, 1); display:block; margin-top: 3px;">
                                Checked Out by: ${user}<br>
                                Date: ${date}
                            </span>
                        `;

                    }

                    // Remove the form
                    formContainer.remove();
                } else {
                    alert("Checkout failed: " + data.error);
                }
            } catch (err) {
                console.error(err);
                alert("Error checking out item");
            }
        };
    };
}

