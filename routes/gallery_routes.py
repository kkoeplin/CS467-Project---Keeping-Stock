from flask import Blueprint, render_template, request, current_app

gallery_bp = Blueprint("gallery", __name__)

@gallery_bp.route("/")
def view():
    db = current_app.config["DB"]
    items_collection = db["test-items"]
    boxes_collection = db["test-boxes"]

    # retrieve all items, boxes, and item tags
    all_items = list(
        items_collection
        .find({}, {"_id": 0, "title": 1, "tags": 1, "box_id": 1, "image": 1})  # specify 1 to include or 0 to exclude fields
        .sort({"title": 1})  # specify 1 for ascending or -1 for descending
    )
    all_boxes = list(boxes_collection.find({}, {"_id": 1, "description": 1}).sort({"description": 1}))
    all_boxes = {b["_id"]: b["description"] for b in all_boxes}
    all_tags = set()  # manually collate tags instead of reading from DB again
    for i in all_items:
        i["box"] = all_boxes.get(i.pop("box_id"), "Box not found")  # safe check
        all_tags.update(i["tags"])

    return render_template(
        "gallery.html", 
        items=all_items,
        all_boxes=list(all_boxes.values()), 
        all_tags=sorted(all_tags),
        default_search="",
        default_box="",
    )

@gallery_bp.route("/filter")
def filtered_view():
    args = request.args
    box = args.get("box")
    tags = args.getlist("tags")
    search = args.get("search", "").strip()

    db = current_app.config["DB"]
    boxes_collection = db["test-boxes"]
    items_collection = db["test-items"]

    # specify filters if used
    query_filter = {}
    all_boxes = list(boxes_collection.find({}, {"_id": 1, "description": 1}))
    if box:
        box_id = next(b["_id"] for b in all_boxes if b["description"] == box)
        query_filter["box_id"] = box_id
    if tags:
        query_filter["tags"] = {"$in": tags}
    if search:
        query_filter["title"] = {"$regex": search.strip(), "$options": "i"}

    # retrieve items based on filters
    items = list(
        items_collection
        .find(query_filter, {"_id": 0, "title": 1, "tags": 1, "box_id": 1, "image": 1})
        .sort({"title": 1})
    )
    all_boxes = {b["_id"]: b["description"] for b in all_boxes}
    for i in items:
        i["box"] = all_boxes.get(i.pop("box_id"), "Box not found")
    
    is_htmx = request.headers.get("HX-Request") == "true"
    if is_htmx:
        # partial reload (default viewing)
        return render_template(
            "gallery_items.html",
            items=items
        )
    else:
        # full reload (mainly when accessing from qr code)
        all_tags = items_collection.distinct("tags")
        return render_template(
            "gallery.html",
            items=items,
            all_boxes=sorted(all_boxes.values()),
            all_tags=all_tags,
            default_search=search,
            default_box=box,
        )
