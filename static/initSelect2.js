// https://stackoverflow.com/questions/65658432/select2-change-event-does-not-trigger-htmx

document.addEventListener("DOMContentLoaded", function() {
    const selects = ["#select-multiple-boxes", "#select-multiple-tags"];

    selects.forEach(id => {
        const select = $(id);

        // initialize Select2
        select.select2({
            width: "100%",
            allowClear: true,
            placeholder: id.includes("boxes") 
            ? "Choose boxes" 
            : "Choose item tags"
        });

        // allow HTMX to detect the change
        select.on("select2:select select2:unselect", function() {
            this.dispatchEvent(new Event("change"));
        });
    });
});
