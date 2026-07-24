import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from mistralai import Mistral

# Load .env
current_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(current_dir, ".env"))

api_key = os.getenv("MISTRAL_API_KEY")

if not api_key:
    raise Exception("MISTRAL_API_KEY not found in .env")

client = Mistral(api_key=api_key)

MODEL_NAME = "mistral-small-latest"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = os.path.join(current_dir, "users_db.json")


# ---------------- DATABASE ---------------- #

def load_db():
    if not os.path.exists(DB_FILE):
        return {}
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except:
        return {}


def save_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)


# ---------------- MODELS ---------------- #

class SyncRequest(BaseModel):
    email: str
    password: str = ""
    profile: dict = None
    history: list = []


class ChatRequest(BaseModel):
    profile: dict
    history: list = []


# ---------------- USER ---------------- #

@app.post("/api/sync_user")
async def sync_user(req: SyncRequest):
    db = load_db()

    email = req.email.lower().strip()

    db[email] = {
        "password": req.password,
        "profile": req.profile,
        "history": req.history
    }

    save_db(db)

    return {"status": "success"}


@app.get("/api/get_user/{email}")
async def get_user(email: str):
    db = load_db()

    email = email.lower().strip()

    if email in db:
        return db[email]

    raise HTTPException(status_code=404, detail="User not found")


# ---------------- CHAT ---------------- #

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        is_first_message = len(req.history) == 0

        transcript = "\n".join(
            [
                f"{'Interviewer' if m.get('sender')=='ai' else 'Candidate'}: {m.get('text','')}"
                for m in req.history
            ]
        )

        # 🔥 FIRST MESSAGE (START INTERVIEW)
        if is_first_message:
            prompt = f"""
You are a Senior Technical Interviewer at {req.profile.get("targetCompany")}.

START the interview.

First message MUST include:
- Greeting
- Your name (realistic, like "Alex Johnson")
- Mention company name
- Ask FIRST question

STRICT RULES:
- Ask ONLY ONE question
- Do NOT wait for user
- Do NOT use placeholders like [Your Name]
- Be professional and natural

Candidate Profile:
Name: {req.profile.get("fullName")}
Role: {req.profile.get("targetRole")}
Difficulty: {req.profile.get("difficulty")}
Tech Stack: {req.profile.get("techStack")}
"""

        # 🔥 CONTINUE INTERVIEW
        else:
            prompt = f"""
You are a Senior Technical Interviewer at {req.profile.get("targetCompany")}.

Continue the interview naturally.

Rules:
- Ask ONLY ONE question at a time
- Ask follow-up based on candidate answer
- If answer is weak → ask to explain more
- If good → go deeper
- Do NOT repeat questions
- Do NOT generate evaluation

Conversation so far:
{transcript}
"""

        # 🔥 LLM CALL (IMPROVED)
        response = client.chat.complete(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict but friendly FAANG-level interviewer. Never use placeholders."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return {
            "text": response.choices[0].message.content
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ---------------- EVALUATION ---------------- #
@app.post("/api/evaluate")
async def evaluate_endpoint(req: ChatRequest):
    try:
        transcript = "\n".join(
            [
                f"{'Interviewer' if m.get('sender')=='ai' else 'Candidate'}: {m.get('text','')}"
                for m in req.history
            ]
        )

        prompt = f"""
You are a strict technical interviewer.

Evaluate the candidate based on the interview.

Return ONLY VALID JSON.

NO explanation.
NO markdown.
NO extra text.

STRICT FORMAT:

{{
  "score": number (0-100),
  "summary": "string",
  "technical_score": number,
  "communication_score": number,
  "confidence_score": number,
  "problem_solving_score": number,
  "strengths": ["point1","point2","point3"],
  "improvements": ["point1","point2","point3"],
  "next_steps": ["step1","step2"],
  "recommendation": "Selected" OR "Borderline" OR "Rejected"
}}

Role: {req.profile.get("targetRole")}
Company: {req.profile.get("targetCompany")}

Transcript:
{transcript}
"""

        response = client.chat.complete(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": "You ONLY return valid JSON. No text."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        text = response.choices[0].message.content.strip()

        # 🔥 CLEAN RESPONSE
        text = text.replace("```json", "").replace("```", "").strip()

        # 🔥 EXTRACT JSON SAFELY
        start = text.find("{")
        end = text.rfind("}") + 1
        json_text = text[start:end]

        return json.loads(json_text)

    except Exception as e:
        return {
            "score": 50,
            "summary": "Evaluation Failed",
            "technical_score": 50,
            "communication_score": 50,
            "confidence_score": 50,
            "problem_solving_score": 50,
            "strengths": ["Interview Completed"],
            "improvements": [str(e)],
            "next_steps": ["Retry Interview"],
            "recommendation": "Retry"
        }


# ---------------- RUN ---------------- #

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",   # ✅ FIX HERE
        port=8000
    )