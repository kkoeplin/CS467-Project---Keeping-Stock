from flask import Blueprint, render_template, request, current_app

item_bp = Blueprint("item", __name__)


@item_bp.route("/create", methods=["GET"])
def create_item_page():
    return render_template("create_item.html")


@item_bp.route("/create", methods=["POST"])
def create_item():
    db = current_app.config["DB"]
    print("POST /items/create")
    return "Item created !"
