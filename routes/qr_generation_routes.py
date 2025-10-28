import qrcode
import io
from flask import Flask, jsonify, send_file, Blueprint, current_app, render_template, abort
from bson.objectid import ObjectId

qr_generation_bp = Blueprint("qr_generation", __name__)

@qr_generation_bp.route("/boxes/<box_id>/generate_qr")
def generate_qr(box_id):
    # Generate QR code for the given box_id
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
    img_io.seek(0)

    return send_file(
        img_io,
        mimetype="image/png",
        as_attachment=True,
        download_name=f"box_{box_id}_qr.png"
    )

@qr_generation_bp.route("/boxes/<box_id>")
def scanned_qr(box_id):
    db = current_app.config["DB"]
    box_db = db["boxes"]
    
    box = box_db.find_one({"_id": ObjectId(box_id)})

    if box:
        return render_template("gallery_items.html", box=box)
    else:
        abort(404, description="Box not found")
    