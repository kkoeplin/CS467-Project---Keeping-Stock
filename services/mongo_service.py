from pymongo import MongoClient
from dotenv import load_dotenv
import certifi
import os

load_dotenv()


def init_db():
    mongo_uri = os.getenv("MONGO_URI")
    client = MongoClient(mongo_uri, tlsCAFile=certifi.where())
    db = client["keeping_stock"]
    return db
