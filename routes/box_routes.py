from flask import Blueprint, render_template, request, current_app, jsonify
from bson import ObjectId

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
        return jsonify({"status": False, "error": "Invalid JSON"}),
    print("Received JSON:", data)

    description = data.get("description")
    if not description:
        return jsonify({"status": False, "error": "Description is required"})

    box_db = db["boxes"]
    inserted = box_db.insert_one({"description": description})

    # Return bo info
    return jsonify({
        "status": True,
        "description": description,
        "box_id": str(inserted.inserted_id) 
    })
