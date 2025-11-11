// Checkout item using flag
//Source: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement
//Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString

export function handleCheckoutButton(item, modal) {
    const checkoutBtn = modal.querySelector("#item-modal-checkout-btn");

    checkoutBtn.onclick = () => {
        const today = new Date().toISOString().split("T")[0]; // Get the date

        modal.innerHTML = `
        <div class="item-modal-checkout" style="border: 2px solid #0c0c0cff; padding: 20px; max-width: 400px; margin: auto; background-color: #ece5f5ff; border-radius: 5px;">
            <h2>Check Out Item</h2>
            <p>Enter your name and the checkout date:</p>
            <form id="item-checkout-form" class="item-checkout-form">
                <div class="form-group">
                    <label for="user"><strong>Your Name:</strong></label>
                    <input type="text" id="user" name="user" placeholder="Enter your name" required style="width: 100%; padding: 5px;">
                </div>

                <div class="form-group">
                    <label for="date"><strong>Date:</strong></label>
                    <input type="date" id="date" name="date" value="${today}" required style="width: 100%; padding: 8px;">
                </div>

                <div class="form-actions" style="margin-top: 20px;">
                    <button type="submit" style="margin-right: 10px;">Check Out</button>
                    <button type="button" id="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
        `;

        // Cancel button handle
        modal.querySelector("#cancel-btn").onclick = () => {
            window.showItemModal({ dataset: { item: JSON.stringify(item) } });
            modal.close();
        };

        // form submission
        modal.querySelector("#item-checkout-form").onsubmit = async (e) => {
            e.preventDefault();

            const user = modal.querySelector("#user").value;
            const date = modal.querySelector("#date").value;

            if (!user.trim()) {
                alert("Enter your name");
                return;
            }

            try {
                const res = await fetch("/items/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ item_ids: [item._id], user, date })
                });

                const data = await res.json();

                if (data.success) {
                    alert(data.message);
                    modal.close();

                    const card = document.getElementById(`item-card-${item._id}`);
                    if (card) card.classList.add("checked-out");
                } else {
                    alert("Checkout fail: " + data.error);
                }
            } catch {
                alert("Error getting item checked out item");
            }
        };
    };
}
