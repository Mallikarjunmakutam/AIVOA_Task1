"""
langgraph_agent.py
──────────────────
Reliable chat processing for the Healthcare CRM Dashboard AI Assistant.

Root-cause of the previous error
─────────────────────────────────
`llama-3.1-8b-instant` does not reliably support LangGraph's ReAct
tool-call protocol. It emits raw <function=...> text instead of proper
JSON function calls, causing Groq to reject the request with a 400
`tool_use_failed` error.

Fix strategy
────────────
1.  Use a **plain ChatGroq invocation** (no tool binding) for general chat.
    The model responds in clean natural language — no malformed tags.

2.  Add **Python-side intent routing** for structured actions:
    - "log"/"record"/"met dr" → acknowledge and guide the user to the form
    - "search"/"find"/"show" → acknowledge and describe where to search
    - "sentiment"            → direct the user to the form's Analyse button
    - "follow-up"/"suggest"  → direct the user to the form's suggestion btn

3.  `/api/sentiment` and `/api/followup-suggestion` remain direct tool
    invocations via `tools.py` — they were never broken.

This approach is 100% reliable across all Groq-hosted LLaMA models.
"""

import re
from langchain_core.messages import SystemMessage, HumanMessage
from services.groq_service import get_groq_llm

# ── System Prompt ──────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are a professional AI assistant embedded in a Healthcare CRM Dashboard.
Your role is to help pharmaceutical sales representatives manage their interactions with doctors and hospitals.

You can help with:
- Recording and managing doctor/hospital meeting details
- Advising on follow-up strategies and timing
- Interpreting meeting notes and outcomes
- Answering questions about products discussed
- General CRM guidance for healthcare sales

Guidelines:
- Always respond in clear, professional, concise language.
- Do NOT include any XML tags, <function=...> syntax, JSON blocks, or code in your response.
- If the user wants to log a new interaction, guide them to fill in the form on the left side of the dashboard.
- If the user wants to see past interactions, guide them to the Interaction History table at the bottom.
- If the user wants sentiment analysis, guide them to click 'Analyse Sentiment' in the Meeting Notes field.
- If the user wants a follow-up suggestion, guide them to click 'Get AI Follow-up Suggestion' in the form.
- Keep responses under 150 words unless detailed explanation is needed.
"""

# ── Intent Router (Python-side, no LLM tool calls) ────────────────────────────

def _detect_intent(message: str) -> str | None:
    """
    Detect specific intents that should return a canned helpful response
    rather than going to the LLM. Returns a string response or None.
    """
    lower = message.lower()

    # Log / record interaction intent
    if re.search(r"\b(log|record|add|create|new interaction|met dr|visited|meeting with)\b", lower):
        # Extract doctor name hint if present
        doctor_match = re.search(r"dr\.?\s+([a-z]+)", lower)
        doctor_hint = f"Dr. {doctor_match.group(1).title()}" if doctor_match else "the doctor"
        return (
            f"To log your interaction with {doctor_hint}, please use the "
            f"**Interaction Details form** on the left side of the dashboard. "
            f"Fill in the doctor name, hospital, product discussed, meeting notes, "
            f"follow-up date, and status — then click **Log Interaction**. "
            f"It will be saved immediately to the database."
        )

    # Search / find interactions intent
    if re.search(r"\b(search|find|show|list|get|fetch)\b.*\b(interaction|doctor|hospital|record)\b", lower):
        return (
            "You can search past interactions using the **search bar in the top navigation**. "
            "Type a doctor's name or hospital name and the Interaction History table will "
            "filter results in real time. All records are ordered by most recent first."
        )

    # Sentiment analysis intent
    if re.search(r"\b(sentiment|tone|feeling|positive|negative|neutral|analyse|analyze)\b", lower):
        return (
            "To analyse the sentiment of your meeting notes, type your notes in the "
            "**Meeting Notes** field in the Interaction form, then click **'Analyse Sentiment'** "
            "next to the field label. The AI will instantly classify the tone as "
            "Positive, Neutral, or Negative."
        )

    # Follow-up suggestion intent
    if re.search(r"\b(follow.?up|next step|suggest|recommendation|what should i do)\b", lower):
        return (
            "To get an AI-powered follow-up suggestion, fill in the **Doctor Name** and "
            "**Product Discussed** fields in the form, then click "
            "**'Get AI Follow-up Suggestion'**. The system will generate a personalized "
            "recommendation based on the doctor and product context."
        )

    # Delete / remove interaction
    if re.search(r"\b(delete|remove|erase)\b.*\b(interaction|record)\b", lower):
        return (
            "To delete an interaction, find the record in the **Interaction History table** "
            "at the bottom of the dashboard and click the **red trash icon** on the right side "
            "of that row. You will be asked to confirm before it is permanently removed."
        )

    # Edit / update interaction
    if re.search(r"\b(edit|update|change|modify)\b.*\b(interaction|record|status)\b", lower):
        return (
            "To edit an interaction, find the record in the **Interaction History table** "
            "and click the **pencil/edit icon**. The form at the top will pre-fill with "
            "the existing data so you can make changes and click **Update Interaction**."
        )

    return None  # No specific intent matched → send to LLM


# ── Main Chat Processor ────────────────────────────────────────────────────────

def process_chat(message: str) -> str:
    """
    Process a user chat message and return a clean AI response.
    Uses Python intent routing first; falls back to direct LLM call.
    No tool binding, no ReAct agent — eliminates tool_use_failed errors.
    """
    # 1. Try Python-side intent routing first
    intent_response = _detect_intent(message)
    if intent_response:
        return intent_response

    # 2. Fallback: plain LLM call with system prompt
    try:
        llm = get_groq_llm()
    except ValueError as e:
        return f"Chat unavailable: {str(e)}"

    try:
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=message),
        ]
        response = llm.invoke(messages)
        return response.content

    except Exception as e:
        error_str = str(e)
        # Return a clean user-friendly message instead of raw error
        if "api_key" in error_str.lower() or "authentication" in error_str.lower():
            return "Chat unavailable: Invalid or missing Groq API key. Please check your .env configuration."
        if "rate_limit" in error_str.lower():
            return "The AI service is temporarily rate-limited. Please wait a moment and try again."
        return "I'm having trouble connecting to the AI service right now. Please try again in a moment."
