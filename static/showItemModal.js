function showItemModal(elem) {
    const modal = document.getElementById("item-modal");
    const item = JSON.parse(elem.dataset.item)
    const deleteUrl = `/gallery/items/${encodeURIComponent(item._id)}`;

    // mirror item card layout, adding buttons
    modal.innerHTML = `<div>
        <img src="${ item.image.replace(/"/g, '') }">
        <h3>${ item.description }</h3>
        <p>Box: ${ item.box }</p>
        <div>${ item.tags.map(t => `<span class="item-card-tag item-modal-tag-font">${ t }</span>`).join(' ')}</div>
        <ul>
            <button 
                type="button"
                id="item-modal-delete-btn" 
                hx-delete="${deleteUrl}"
                hx-target="#item-card-${item._id}"
                hx-swap="outerHTML"
                hx-disabled-elt="this, #item-modal-close-btn"
                hx-on::after-on-load="
                    if (event.detail.successful) {
                        alert('The item has been deleted.');
                        this.closest('dialog').close();
                    } else {
                        alert(event.detail.xhr.responseText);
                    }
                "
            >
                Delete
            </button>
            <button 
                type="button"
                id="item-modal-close-btn" 
                onclick="this.closest('dialog').close()"
            >
                Close
            </button>
        </ul>
    </div>`;
    modal.showModal();

    // required to specify this if htmx is included in javascript
    htmx.process(modal);
}
