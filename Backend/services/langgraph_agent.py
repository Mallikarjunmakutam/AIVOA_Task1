from langgraph.prebuilt import create_react_agent
from services.groq_service import get_groq_llm
from services.tools import tools

# Ensure the environment has GROQ_API_KEY set, else this agent instantiation might fail.
def get_agent():
    try:
        llm = get_groq_llm()
        agent = create_react_agent(llm, tools)
        return agent
    except ValueError as e:
        print(f"Agent warning: {e}")
        return None

def process_chat(message: str) -> str:
    agent = get_agent()
    if not agent:
        return "Chat unavailable: GROQ API Key missing or invalid configuration."
    try:
        # LangGraph inputs
        inputs = {"messages": [("user", message)]}
        out = agent.invoke(inputs)
        return out["messages"][-1].content
    except Exception as e:
        return f"Agent error: {str(e)}"
