import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")


def get_groq_llm():
    """
    Returns a configured ChatGroq LLM instance.

    Model choice: llama-3.3-70b-versatile
    ───────────────────────────────────────
    We use the 70b versatile model for general chat because:
    - It produces clean, well-structured natural-language responses.
    - It does NOT emit malformed <function=...> syntax like the 8b model.
    - Groq's LPU hardware keeps latency low even for the 70b model.

    For direct tool calls (sentiment_analysis, followup_suggestion),
    those tools are invoked directly in Python — no model tool binding needed.
    """
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY environment variable not set")
    return ChatGroq(
        temperature=0.7,
        model_name="llama-3.3-70b-versatile",
        api_key=groq_api_key,
    )
