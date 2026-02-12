import os
import json
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["https://my-royal-estate-app.vercel.app", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"]
)

CEREBRAS_KEY = os.getenv("CEREBRAS_API_KEY")
EXCHANGE_KEY = os.getenv("EXCHANGE_API_KEY")

client = Cerebras(api_key=CEREBRAS_KEY)

def get_live_rates():
    try:
        url = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_KEY}/latest/USD"
        res = requests.get(url, timeout=5).json()
        return res.get('conversion_rates', {})
    except:
        return {"SAR": 3.75, "INR": 83.5, "AED": 3.67, "USD": 1.0, "GBP": 0.79}

class ChatRequest(BaseModel):
    message: str

class DescriptionRequest(BaseModel):
    title: str
    features: str
    location: str

class ROIRequest(BaseModel):
    title: str
    location: str
    price: str
    features: str

user_context = {"last_location": "", "last_language": "English"}

@app.get("/")
async def root():
    return {"message": "Royal Estate AI Server - Fast & Permanent!"}

@app.post("/chat")
async def ask_ai(request: ChatRequest):
    global user_context
    try:
        user_msg = request.message.lower()
        
        if any(char in user_msg for char in ['ا', 'ب', 'ت', 'ث', 'ج', 'ح']):
            detected_lang = "Arabic"
        elif any(word in user_msg for word in ['mein', 'hai', 'kya', 'chahiye', 'property', 'ghar']):
            detected_lang = "Hindi"
        else:
            detected_lang = "English"

        locations = {
            "riyadh": "Riyadh", "dubai": "Dubai", "bangalore": "Bangalore",
            "mumbai": "Mumbai", "delhi": "Delhi", "jeddah": "Jeddah",
            "abu dhabi": "Abu Dhabi", "doha": "Doha", "hyderabad": "Hyderabad",
            "kolkata": "Kolkata", "pune": "Pune", "chennai": "Chennai",
            "mecca": "Mecca", "medina": "Medina", "dammam": "Dammam"
        }
        
        current_loc = user_context.get("last_location", "")
        for key, value in locations.items():
            if key in user_msg:
                current_loc = value
                user_context["last_location"] = value
                break

        system_prompt = f"""
You are Royal Estate Investment Advisor speaking in {detected_lang}.

🚫 ABSOLUTE RULES (NEVER VIOLATE):
- NEVER provide links, URLs, or website addresses
- NEVER say "click here", "visit", or mention website navigation
- NEVER mention listing IDs or specific pages
- NEVER tell users to "check our website"

✅ YOUR ROLE:
- Have natural, helpful conversations about real estate
- Discuss investment strategies and market trends
- Give insights about {current_loc if current_loc else 'different cities'}
- Answer questions about property types, rental yields, appreciation
- Be professional but friendly and conversational

RESPONSE STYLE:
- Keep answers SHORT (2-3 sentences maximum)
- Be direct and helpful
- If asked about specific properties, discuss general options in that area
- Focus on advisory role, not directing to website

Example good responses:
User: "Tell me about Dubai properties"
You: "Dubai's real estate market is booming with Vision 2033. Areas like Downtown and Marina offer 6-8% rental yields. What type of property interests you - residential or commercial?"

User: "Show me listings"
You: "I can help you understand what's available in different areas. Are you looking for luxury villas, apartments, or commercial spaces? And what's your budget range?"
"""
        
        final_res = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt}, 
                {"role": "user", "content": request.message}
            ],
            model="llama3.1-8b",
            temperature=0.4,
            max_tokens=200
        )
        
        response_text = final_res.choices[0].message.content
        
        if "http" in response_text or "www." in response_text or ".com" in response_text:
            response_text = "I'm here to discuss properties and investment opportunities. What specific information can I help you with?"
        
        return {
            "response": response_text,
            "results": []
        }
        
    except Exception as e:
        return {
            "response": "I'm here to help with your property questions. What would you like to know about real estate investment?",
            "results": []
        }

@app.post("/generate-listing-ai")
async def generate_listing(request: DescriptionRequest):
    try:
        gulf_countries = ["uae", "saudi", "riyadh", "dubai", "qatar", "kuwait", "bahrain", "oman", "abu dhabi", "jeddah"]
        is_gulf = any(word in request.location.lower() for word in gulf_countries)

        prompt = f"""Write a professional real estate listing for {request.title} in {request.location}. 
        Features: {request.features}. {'Provide English and Arabic' if is_gulf else 'English ONLY'}. 
        No fillers."""

        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3.1-8b",
            temperature=0.3
        )
        return {"content": response.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}

@app.post("/ai-roi-prediction")
async def predict_roi(data: ROIRequest):
    try:
        gulf_countries = ["UAE", "United Arab Emirates", "Saudi Arabia", "KSA", "Qatar", "Kuwait", "Bahrain", "Oman", "Dubai", "Abu Dhabi", "Riyadh"]
        is_gulf = any(country.lower() in data.location.lower() for country in gulf_countries)

        if is_gulf:
            language_instruction = "Provide the analysis in both English and Arabic (Bilingual)."
        else:
            language_instruction = "Provide the analysis in English only."

        prompt = f"""
        You are a Real Estate Expert. Analyze this property:
        Title: {data.title}
        Location: {data.location}
        Price: {data.price}
        Description: {data.features}

        Instruction: {language_instruction}
        
        Format the report as:
        1. Rental Yield % (Estimated)
        2. 5-Year Appreciation Potential
        3. Final Recommendation (BUY/HOLD/SELL)
        """

        completion = client.chat.completions.create(
            model="llama3.1-8b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        return {"analysis": completion.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
