// Get item checked back in 

export function handleCheckinButton(item, modal) {
    const checkinBtn = modal.querySelector("#item-modal-checkin-btn");
    if (!checkinBtn) return;

    checkinBtn.onclick = async () => {
        try {
            const res = await fetch("/items/checkin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_ids: [item._id] })
            });
            const data = await res.json();

            if (data.success) {
                // Update item
                item.checked_out = false;
                item.checked_out_by = "";
                item.checkout_date = "";

                // Update text
                const info = modal.querySelector("#item-checked-out-info");
                if (info) info.textContent = "";

                // Update buttons
                checkinBtn.hidden = true;
                const checkoutBtn = modal.querySelector("#item-modal-checkout-btn");
                if (checkoutBtn) checkoutBtn.hidden = false;

                // Update galler card
                const card = document.getElementById(`item-card-${item._id}`);
                if (card) {
                    card.classList.remove("checked-out");
                    const desc = card.querySelector(".item-description");
                    if (desc) desc.innerHTML = item.description;
                }
            } else {
                alert("Check-in failed: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Error checking in item");
        }
    };
}


