// https://stackoverflow.com/questions/65658432/select2-change-event-does-not-trigger-htmx

document.addEventListener("DOMContentLoaded", function() {
    const select = $("#select-multiple");
    const hiddenBoxes = document.getElementById("hidden-boxes");
    const hiddenTags  = document.getElementById("hidden-tags");

    // initialize Select2
    select.select2({
        width: "100%",
        placeholder: "Choose boxes and/or item tags",
        allowClear: true
    });

    select.on("select2:select select2:unselect", function() {

        // split selected options into separate arrays
        const boxes = [];
        const tags  = [];
        select.find("option:selected").each(function() {
            const group = $(this).data("group");
            const value = this.value;
            if (group === "boxes") {
                boxes.push(value);
            }
            else if (group === "tags") {
                tags.push(value);
            }
        });
        hiddenBoxes.value = boxes.join(",");
        hiddenTags.value  = tags.join(",");

        // allow HTMX to detect the change 
        this.dispatchEvent(new Event("change"));
    });
});
