from bson import ObjectId
from flask import Blueprint, render_template, request, current_app


ITEMS_COLLECTION_NAME = "items"
BOXES_COLLECTION_NAME = "boxes"

gallery_bp = Blueprint("gallery", __name__)

def _query_items_boxes(items_collection, boxes_collection, items_query_filter, boxes_query_filter, return_tags=False):
    # retrieve items based on filter
    items = list(
        items_collection
        .find(items_query_filter, {"_id": 1, "description": 1, "tags": 1, "box_id": 1, "image": 1})  # specify 1 to include or 0 to exclude fields
        .sort({"description": 1})  # specify 1 for ascending or -1 for descending
    )

    # retrieve boxes based on filter
    boxes = list(
        boxes_collection
        .find(boxes_query_filter, {"_id": 1, "description": 1})
        .sort({"description": 1})
    )

    # clean up data fields
    boxes = {str(b["_id"]): b["description"] for b in boxes}
    for i in items:
        i["box"] = boxes.get(str(i.pop("box_id")), "Not found")  # safe check
        i["_id"] = str(i["_id"])
        i["description"] = i["description"].title()
    
    tags = None
    if return_tags:
        # manually collate tags instead of reading from DB again
        tags = sorted(t for i in items for t in i["tags"])

    return items, boxes, tags

@gallery_bp.route("/")
def view():
    db = current_app.config["DB"]
    items_collection = db[ITEMS_COLLECTION_NAME]
    boxes_collection = db[BOXES_COLLECTION_NAME]

    # retrieve all items, boxes, and item tags
    all_items, all_boxes, all_tags = _query_items_boxes(items_collection, boxes_collection, {}, {}, return_tags=True)

    return render_template(
        "gallery.html", 
        items=all_items,
        all_boxes=all_boxes, 
        all_tags=all_tags,
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

    # specify item filters if used
    items_query_filter = {}
    if box_id:
        items_query_filter["box_id"] = str(box_id)
    if tags:
        items_query_filter["tags"] = {"$in": tags}
    if search:
        items_query_filter["description"] = {"$regex": search.strip(), "$options": "i"}

    # specify box filters if partial reload
    boxes_query_filter = {"_id": ObjectId(items_query_filter["box_id"])} if (box_id and is_htmx) else {}

    # retrieve items and boxes based on filter
    items, boxes, _ = _query_items_boxes(items_collection, boxes_collection, items_query_filter, boxes_query_filter)

    if is_htmx:
        # partial reload (default viewing)
        return render_template(
            "gallery_items.html",
            items=items
        )
    else:
        # full reload (mainly when accessing from qr code)
        all_tags = items_collection.distinct("tags", {"tags": {"$ne": None}})
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
