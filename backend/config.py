import os
from datetime import timedelta
from dotenv import load_dotenv
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///dev.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-jwt")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    RESERVE_ON_DEPOSIT = os.getenv("RESERVE_ON_DEPOSIT", "true").lower() in ("1","true","yes")
