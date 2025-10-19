from flask import Blueprint, render_template, request, current_app, jsonify
from bson import ObjectId

# Used for box qr codes?
import qrcode
import io 
import base64


box_bp = Blueprint("box", __name__)


# Create Box Page
@box_bp.route("/create", methods=["GET"])
def create_box_page():
    return render_template("create_box.html")


# Create box
@box_bp.route("/create", methods=["POST"])
def create_box():
    db = current_app.config["DB"]

    data = request.get_json()
    if not data:
        return jsonify({"status": False, "error": "Invalid JSON"})
    print("Received JSON:", data)

    description = data.get("description")
    if not description:
        return jsonify({"status": False, "error": "Description is required"})

    box_db = db["boxes"]
    inserted = box_db.insert_one({"description": description})

    # Return box info
    return jsonify({
        "status": True,
        "description": description,
        "box_id": str(inserted.inserted_id)
    })


# List of boxes 
@box_bp.route("/view", methods=["GET"])
def view_boxes():
    db = current_app.config["DB"]
    box_db = db["boxes"]

    boxes = list(box_db.find())  # get all boxes
    return render_template("view_box.html", boxes=boxes)


# Delete boxes
@box_bp.route("/delete/<box_id>", methods=["POST"])
def delete_box(box_id):
    print("Deleting box:", box_id)
    db = current_app.config["DB"]
    box_db = db["boxes"]

    if not box_id:
        return jsonify({"status": False, "error": "Need Box ID"})
    
    # delete the box
    delete_result = box_db.delete_one({"_id": ObjectId(box_id)})

    # Check if the box was deleted
    if delete_result.deleted_count == 1:
        return jsonify({"status": True, "message": "Box deleted"})
    else:
        return jsonify({"status": False, "error": "Box not found"})

# Update Box
