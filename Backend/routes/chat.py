from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from services.langgraph_agent import process_chat
from services.tools import sentiment_analysis, followup_suggestion
import schemas, models
from database import get_db

router = APIRouter(
    prefix="/api",
    tags=["ai"]
)

class SentimentRequest(BaseModel):
    notes: str

class FollowupRequest(BaseModel):
    doctor_name: str
    product_discussed: str

@router.post("/chat", response_model=schemas.ChatResponse)
def chat_endpoint(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    response_text = process_chat(request.message)
    # Save chat log to DB
    try:
        log = models.ChatLog(user_message=request.message, ai_response=response_text)
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Warning: Could not save chat log: {e}")
    return schemas.ChatResponse(reply=response_text)

@router.post("/sentiment")
def sentiment_endpoint(request: SentimentRequest):
    result = sentiment_analysis.invoke({"notes": request.notes})
    return {"sentiment": result}

@router.post("/followup-suggestion")
def followup_endpoint(request: FollowupRequest):
    result = followup_suggestion.invoke({
        "doctor_name": request.doctor_name,
        "product_discussed": request.product_discussed
    })
    return {"suggestion": result}
