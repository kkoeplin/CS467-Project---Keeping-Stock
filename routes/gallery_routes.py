from bson import ObjectId
from flask import Blueprint, render_template, request, current_app, jsonify


ITEMS_COLLECTION_NAME = "items"
BOXES_COLLECTION_NAME = "boxes"

gallery_bp = Blueprint("gallery", __name__)

@gallery_bp.route("/")
def view():
    db = current_app.config["DB"]
    items_collection = db[ITEMS_COLLECTION_NAME]
    boxes_collection = db[BOXES_COLLECTION_NAME]

    # retrieve all items, boxes, and item tags
    all_items = list(
        items_collection
        .find({}, {"_id": 1, "description": 1, "tags": 1, "box_id": 1, "image": 1})  # specify 1 to include or 0 to exclude fields
        .sort({"description": 1})  # specify 1 for ascending or -1 for descending
    )
    all_boxes = list(
        boxes_collection
        .find({}, {"_id": 1, "description": 1})
        .sort({"description": 1})
    )
    all_boxes = {str(b["_id"]): b["description"] for b in all_boxes}
    all_tags = set()  # manually collate tags instead of reading from DB again
    for i in all_items:
        i["box"] = all_boxes.get(str(i.pop("box_id")), "Box not found")  # safe check
        i["_id"] = str(i["_id"])
        i["description"] = i["description"].title()
        all_tags.update(i["tags"])

    return render_template(
        "gallery.html", 
        items=all_items,
        all_boxes=all_boxes, 
        all_tags=sorted(all_tags),
        checked_tags=[],
        default_search="",
        default_box_id="",
    )

@gallery_bp.route("/filter")
def filtered_view():
    args = request.args
    box_id = args.get("box")
    tags = args.getlist("tags")
    search = args.get("search", "").strip()
    is_htmx = request.headers.get("HX-Request") == "true"

    db = current_app.config["DB"]
    items_collection = db[ITEMS_COLLECTION_NAME]
    boxes_collection = db[BOXES_COLLECTION_NAME]

    # specify filters if used
    items_query_filter = {}
    if box_id:
        items_query_filter["box_id"] = str(box_id)
    if tags:
        items_query_filter["tags"] = {"$in": tags}
    if search:
        items_query_filter["description"] = {"$regex": search.strip(), "$options": "i"}

    # retrieve items based on filters
    items = list(
        items_collection
        .find(items_query_filter, {"_id": 1, "description": 1, "tags": 1, "box_id": 1, "image": 1})
        .sort({"description": 1})
    )

    # retrieve boxes based on filters for partial reload
    boxes_query_filter = {"_id": ObjectId(items_query_filter["box_id"])} if (box_id and is_htmx) else {}
    boxes = list(
        boxes_collection
        .find(boxes_query_filter, {"_id": 1, "description": 1})
        .sort({"description": 1})
    )
    boxes = {str(b["_id"]): b["description"] for b in boxes}
    for i in items:
        i["box"] = boxes.get(str(i.pop("box_id")), "Box not found")
        i["_id"] = str(i["_id"])
        i["description"] = i["description"].title()

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
            all_boxes=boxes,
            all_tags=all_tags,
            checked_tags=tags,
            default_search=search,
            default_box_id=box_id,
        )

@gallery_bp.route("/items/<item_id>", methods=["DELETE"])
def delete_item(item_id):
    db = current_app.config["DB"]
    items_collection = db[ITEMS_COLLECTION_NAME]
    result = items_collection.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        return "Failed to delete item. Item not found.", 404
    return ""  # must return 200 (default) for item card to be removed using htmx


@gallery_bp.route("/items/<item_id>", methods=["POST"])
def update_item(item_id):

    print("Updating item:", item_id)
    db = current_app.config["DB"]
    items_collection = db[ITEMS_COLLECTION_NAME]
    boxes_collection = db[BOXES_COLLECTION_NAME]

    if not item_id:
        return jsonify({"status": False, "error": "Need the item ID"})

    # Get data 
    data = request.get_json() or {}
    new_desc = data.get("description")
    new_tags = data.get("tags")
    new_box_name = data.get("box_id")

    # Check for empty descripts or spaces
    if new_desc is not None and not new_desc.strip():
        return jsonify({"status": False, "error": "Description can't be empty or spaces only"})

    # Udate the items fields
    update_fields = {}

    if new_desc is not None:
        update_fields["description"] = new_desc.strip()
    if new_tags is not None:
        update_fields["tags"] = new_tags

    if new_box_name:
        box_doc = boxes_collection.find_one({"_id": ObjectId(new_box_name)})
        if not box_doc:
            return jsonify({"status": False, "error": "Box not found"})
        
        update_fields["box_id"] = str(box_doc["_id"])

    if not update_fields:
        return jsonify({"status": False, "error": "No fields were updated"})
    
    update_result = items_collection.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": update_fields}
    )
    # Respond based on result
    if update_result.modified_count == 1:
        return jsonify({"status": True, "message": "Item was updated"})
    else:
        return jsonify({"status": False, "error": "No changes where made"})