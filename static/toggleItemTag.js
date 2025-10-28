document.addEventListener("change", (e) => {
    // find the tag storing the checkbox for styling
    if (!e.target.matches(".tag-checkbox")) return;  
    const label = e.target.closest(".tag"); 
    label.classList.toggle("is-checked", e.target.checked);
});
