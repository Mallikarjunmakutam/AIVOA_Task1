from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import interactions, chat
import models

# Create database tables strictly
models.Base.metadata.create_all(bind=engine)
print("Database tables created/verified successfully.")

app = FastAPI(title="Healthcare CRM Dashboard API")

# Configure CORS for React frontend (Vite defaults to 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(interactions.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Healthcare CRM Dashboard API"}
