from flask import Blueprint, render_template, request

gallery_bp = Blueprint("gallery", __name__)

ALL_ITEMS = [
    ('Backpack', 'Cabinet', ['black', 'bag']),
    ('Apple', 'Kitchen', ['red', 'food']),
    ('Banana', 'Kitchen', ['yellow', 'food']),
    ('Gloves', 'Cabinet', ['clothing']),
    ('Handbag', 'Cabinet', ['red', 'bag', 'leather']),
    ('Watch', 'Cabinet', ['accessory', 'leather']),
    ('Glasses', 'Cabinet', ['accessory']),
]
ALL_BOXES = sorted({i[1] for i in ALL_ITEMS})
ALL_TAGS = sorted({t for i in ALL_ITEMS for t in i[2]})

@gallery_bp.route("/")
def view():
    return render_template(
        "gallery.html", 
        items=ALL_ITEMS,
        all_boxes=ALL_BOXES, 
        all_tags=ALL_TAGS
    )

@gallery_bp.route("/filter")
def filtered_view():
    args = request.args
    box = args.get('box')
    tags = args.getlist('tags')
    search = args.get('search').strip()

    items = ALL_ITEMS
    if box:
        items = [i for i in items if i[1] == box]
    if tags:
        items = [i for i in items if any(t in i[2] for t in tags)]
    if search:
        items = [i for i in items if search.lower() in i[0].lower()]

    return render_template(
        "gallery_items.html",
        items=items
    )
