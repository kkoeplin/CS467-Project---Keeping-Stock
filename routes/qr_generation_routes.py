import qrcode
import io
from flask import Flask, jsonify, send_file, Blueprint, current_app, render_template, abort
from bson.objectid import ObjectId
from bson.binary import Binary

qr_generation_bp = Blueprint("qr_generation", __name__)

@qr_generation_bp.route("/boxes/<box_id>/generate_qr")
def generate_qr(box_id):

    try:
        db = current_app.config["DB"]
        collection = db["qr_codes"]

        existing = collection.find_one({"box_id": box_id})

        if existing:
            # Return existing QR from DB
            image_bytes = existing["image"]  # this is a Binary type
            img_io = io.BytesIO(image_bytes)
            img_io.seek(0)

            return send_file(
                img_io,
                mimetype="image/png",
                as_attachment=True,
                download_name=f"box_{box_id}_qr.png"
            )

        # 2. Generate new QR because it doesn't exist
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(box_id)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        img_io = io.BytesIO()
        img.save(img_io, 'PNG')
        img_bytes = img_io.getvalue()  # get raw bytes
        img_io.seek(0)

        # 3. Save QR to MongoDB
        collection.insert_one({
            "box_id": box_id,
            "image": Binary(img_bytes),
        })

        # 4. Return generated image
        return send_file(
            img_io,
            mimetype="image/png",
            as_attachment=True,
            download_name=f"box_{box_id}_qr.png"
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
        

@qr_generation_bp.route("/boxes/<box_id>")
def scanned_qr(box_id):
    db = current_app.config["DB"]
    box_db = db["boxes"]
    
    box = box_db.find_one({"_id": ObjectId(box_id)})

    if box:
        return render_template("gallery_items.html", box=box)
    else:
        abort(404, description="Box not found")
    