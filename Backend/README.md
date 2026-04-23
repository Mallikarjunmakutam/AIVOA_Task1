# Healthcare CRM Dashboard Backend

## Setup
1. Create a virtual environment:
   `python -m venv venv`
2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix: `source venv/bin/activate`
3. Install dependencies:
   `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and fill in your details:
   - `DATABASE_URL`: PostgreSQL connection string.
   - `GROQ_API_KEY`: Groq API key for LLM integrations.
5. Startup the server:
   `uvicorn main:app --reload`
