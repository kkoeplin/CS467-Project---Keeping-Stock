from flask import Flask, render_template, url_for, redirect
from routes.item_routes import item_bp
from routes.gallery_routes import gallery_bp
from services.mongo_service import init_db
from dotenv import load_dotenv
from openai import OpenAI

import os

load_dotenv()

app = Flask(__name__)

db = init_db()
app.config["DB"] = db

app.config["AI_CLIENT"] = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Register blueprints
app.register_blueprint(item_bp, url_prefix="/items")
app.register_blueprint(gallery_bp, url_prefix="/gallery")


@app.route("/")
def home():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
