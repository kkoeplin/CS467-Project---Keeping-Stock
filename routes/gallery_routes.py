from flask import Blueprint, render_template, request, current_app

gallery_bp = Blueprint("gallery", __name__)

@gallery_bp.route("/")
def view():
    db = current_app.config["DB"]
    items_collection = db["test-items"]
    boxes_collection = db["test-boxes"]

    all_items = list(
        items_collection
        .find({}, {"_id": 0, "title": 1, "tags": 1, "box_id": 1, "image": 1})  # specify 1 to include or 0 to exclude fields
        .sort({"title": 1})  # specify 1 for ascending or -1 for descending
    )
    all_boxes = list(boxes_collection.find({}).sort({"description": 1}))
    all_boxes = {b["_id"]: b["description"] for b in all_boxes}
    all_tags = set()  # manually collate tags instead of reading from DB again
    for i in all_items:
        i["box_description"] = all_boxes.get(i.pop("box_id"), "Box not found")  # safe check
        all_tags.update(i["tags"])

    return render_template(
        "gallery.html", 
        items=all_items,
        all_boxes=list(all_boxes.values()), 
        all_tags=sorted(all_tags)
    )

@gallery_bp.route("/filter")
def filtered_view():
    args = request.args
    box_description = args.get("box-description")
    tags = args.getlist("tags")
    search = args.get("search").strip()

    db = current_app.config["DB"]
    boxes_collection = db["test-boxes"]
    items_collection = db["test-items"]

    query_filter = {}
    all_boxes = list(boxes_collection.find({}))
    if box_description:
        box_id = next(b["_id"] for b in all_boxes if b["description"] == box_description)
        query_filter["box_id"] = box_id
    if tags:
        query_filter["tags"] = {"$in": tags}
    if search:
        query_filter["title"] = {"$regex": search, "$options": "i"}

    items = list(
        items_collection
        .find(query_filter, {"_id": 0, "title": 1, "tags": 1, "box_id": 1, "image": 1})
        .sort({"title": 1})
    )
    all_boxes = {b["_id"]: b["description"] for b in all_boxes}
    for i in items:
        i["box_description"] = all_boxes.get(i.pop("box_id"), "Box not found")
    
    return render_template(
        "gallery_items.html",
        items=items
    )
