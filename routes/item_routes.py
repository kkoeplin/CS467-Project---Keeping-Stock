from flask import Blueprint, request, jsonify, render_template, current_app
import base64, json, os, certifi
from pymongo import MongoClient

item_bp = Blueprint("items", __name__)

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri, tlsCAFile=certifi.where())
db = client["keeping_stock"]
items_collection = db["items"]

item_bp = Blueprint("item", __name__)


@item_bp.route("/create", methods=["GET"])
def create_item_page():
    return render_template("create_item.html")


@item_bp.route("/create", methods=["POST"])
def create_item():
    ai_client = current_app.config["AI_CLIENT"]
    try:
        data = request.get_json()
        if not data or "image" not in data:
            return jsonify({"success": False, "error": "No image provided"}), 400

        image_data = data["image"]
        header, encoded = image_data.split(",", 1)
        image_bytes = base64.b64decode(encoded)

        ai_response = ai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Describe only the main item in this image as if adding it to an inventory list. Exclude people, background, or context. Return JSON with: 'description': concise item name (no adjectives beyond basic identifiers).'tags': list of relevant relevant keywords.",
                        },
                        {"type": "image_url", "image_url": {"url": image_data}},
                    ],
                }
            ],
        )

        result_text = ai_response.choices[0].message.content.strip()
        result_text = result_text.replace("```json", "").replace("```", "")
        result_json = json.loads(result_text)

        description = result_json.get("description", "")
        tags = result_json.get("tags", [])

        return jsonify({"success": True, "description": description, "tags": tags})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@item_bp.route("/save", methods=["POST"])
def save_item():
    data = request.get_json()
    item = {
        "image": data.get("image"),
        "description": data.get("description"),
        "tags": data.get("tags", []),
        "box_id": data.get("box_id"),
        "removed":"No" # always no when first creating the item
    }
    items_collection.insert_one(item)
    return jsonify({"success": True})

@item_bp.route("/in_box/<box_id>", methods=['GET'])
def get_items_by_box(box_id):
    try: 
        items =  list(items_collection.find({"box_id": box_id}, {"_id": 1, "description": 1}))
        for item in items:
            item["_id"] = str(item["_id"])
        return jsonify(items), 200
    except Exception as e:
        return jsonify({"error": "Failed to retrieve items for this box."}), 500
    