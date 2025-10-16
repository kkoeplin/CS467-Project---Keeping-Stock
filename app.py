from flask import Flask, render_template, url_for, redirect
from routes.item_routes import item_bp
from routes.gallery_routes import gallery_bp
from services.mongo_service import init_db
from routes.box_routes import box_bp
from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()
app = Flask(__name__)

db = init_db()
app.config["DB"] = db

# ai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# app.config["AI_CLIENT"] = ai_client

# Register blueprints
app.register_blueprint(item_bp, url_prefix="/items")
app.register_blueprint(gallery_bp, url_prefix="/gallery")
app.register_blueprint(box_bp, url_prefix="/boxes")

@app.route("/")
def home():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
