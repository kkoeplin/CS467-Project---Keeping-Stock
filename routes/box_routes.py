from flask import Blueprint, render_template, request, current_app

box_bp = Blueprint("box", __name__)


@box_bp.route("/create", methods=["GET"])
def create_box_page():
    return render_template("create_box.html")


@box_bp.route("/create", methods=["POST"])
def create_box():
    db = current_app.config["DB"]
    print("POST /boxes/create")
    return "Box created !"
