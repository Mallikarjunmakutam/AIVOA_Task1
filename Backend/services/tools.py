from langchain.tools import tool
from typing import Optional

# 1. log_interaction
@tool
def log_interaction(doctor_name: str, hospital_name: str, product_discussed: str, meeting_notes: str = "", followup_date: str = "", status: str = "Planned") -> str:
    """Useful to log a new healthcare interaction into the database."""
    # In a real app, you would inject the DB session and write to SQL.
    # We will simulate this response for the LangGraph agent tool call.
    return f"Interaction logged for {doctor_name} at {hospital_name} concerning {product_discussed}."

# 2. edit_interaction
@tool
def edit_interaction(interaction_id: int, status: str) -> str:
    """Useful to update the status or details of an existing interaction."""
    return f"Interaction {interaction_id} updated to status '{status}'."

# 3. search_interactions
@tool
def search_interactions(query: str) -> str:
    """Useful to search through past interactions."""
    return f"Search results for '{query}': Found 2 past interactions matching the criteria."

# 4. sentiment_analysis
@tool
def sentiment_analysis(notes: str) -> str:
    """Analyzes the sentiment of meeting notes. Returns positive, neutral, or negative."""
    # Simple mock logic
    notes_lower = notes.lower()
    if "great" in notes_lower or "interested" in notes_lower:
        return "positive"
    elif "bad" in notes_lower or "not interested" in notes_lower:
        return "negative"
    return "neutral"

# 5. followup_suggestion
@tool
def followup_suggestion(doctor_name: str, product_discussed: str) -> str:
    """Generates an AI suggestion for next follow-up action based on product and doctor."""
    return f"Suggestion: Follow up with {doctor_name} next week with a clinical trial report on {product_discussed}."

tools = [
    log_interaction,
    edit_interaction,
    search_interactions,
    sentiment_analysis,
    followup_suggestion
]
