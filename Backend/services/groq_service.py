import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")

def get_groq_llm():
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY environment variable not set")
    # You can choose a model like llama-3.1-70b-versatile or llama-3.1-8b-instant
    return ChatGroq(temperature=0.7, model_name="llama-3.1-8b-instant", api_key=groq_api_key)
