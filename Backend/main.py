from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import interactions, chat
import models

# Create database tables strictly
models.Base.metadata.create_all(bind=engine)
print("Database tables created/verified successfully.")

app = FastAPI(title="Healthcare CRM Dashboard API")

# Configure CORS to accept all origins dynamically to prevent varying Vite ports (e.g. 5174) from getting CORS blocked.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(interactions.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Healthcare CRM Dashboard API"}
