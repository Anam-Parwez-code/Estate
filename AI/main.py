
import os
import json
import requests
from fastapi import FastAPI,HTTPException
from fastapi.responses import StreamingResponse
import asyncio
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# --- CORS setup (Fixed for Preflight) ---
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["https://my-royal-estate-app.vercel.app", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"]
)

# --- CONFIG ---
CEREBRAS_KEY = os.getenv("CEREBRAS_API_KEY")
EXCHANGE_KEY = os.getenv("EXCHANGE_API_KEY")
BASE_SITE_URL = "https://my-royal-estate-app.vercel.app" 
LISTING_API_URL = "https://royal-estate-uzii.onrender.com/api/listing/get-all-chatbot"

client = Cerebras(api_key=CEREBRAS_KEY)

# Helper: Live Currency Rates
def get_live_rates():
    try:
        url = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_KEY}/latest/USD"
        res = requests.get(url, timeout=5).json()
        return res.get('conversion_rates', {})
    except:
        return {"SAR": 3.75, "INR": 83.5, "AED": 3.67, "USD": 1.0, "GBP": 0.79}

# --- MODELS (Fixed: Added ROIRequest) ---
class ChatRequest(BaseModel):
    message: str

class DescriptionRequest(BaseModel):
    title: str
    features: str
    location: str

class ROIRequest(BaseModel): # <--- Ye missing tha
    title: str
    location: str
    price: str
    features: str

user_context = {"last_location": "", "last_language": "English"}
@app.get("/")
async def root():
    return {"message": "AI Server is running!"}

# --- ENDPOINT 1: AI Chatbot ---
# --- Updated ENDPOINT: AI Property Advisor ---
@app.post("/chat")
async def ask_ai(request: ChatRequest):
    try:
        user_msg = request.message

        # 1. Quick Language & Context Detection (Temperature 0 for Speed)
        extraction_prompt = f"Detect language (Arabic/English/Hindi/Roman Hindi) and city from: '{user_msg}'. Return ONLY JSON: {{\"location\": \"city\", \"lang\": \"language\"}}"
        
        ex_res = client.chat.completions.create(
            messages=[{"role": "user", "content": extraction_prompt}],
            model="llama3.1-8b",
            temperature=0
        )
        
        try:
            content = ex_res.choices[0].message.content.strip()
            info = json.loads(content)
        except:
            info = {"location": "Riyadh", "lang": "English"}

        # 2. STREAMING ADVISOR ENGINE (Real-time speed)
        async def event_generator():
            system_prompt = f"""
            You are the 'Royal Estate Global Investment Advisor'. 
            ROLE: You are a professional human-like consultant. 
            STRICT RULES:
            1. DO NOT search or provide property listings or database links.
            2. PROVIDE expert advice on market trends, ROI, and investment benefits.
            3. If the user mentions Riyadh or Saudi, talk about 'Vision 2030' and why it's a goldmine.
            4. LANGUAGES: Reply in the SAME language/style as the user. (Support: Arabic, Hindi, Roman Hindi, English).
            5. If they ask for specific houses, tell them: "Main aapko market ki sahi jaankari de sakta hoon, properties dekhne ke liye hamara search page check karein."
            6. Tone: Royal, Wise, and Fast.
            """
            
            stream = client.chat.completions.create(
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_msg}],
                model="llama3.1-8b",
                temperature=0.3, # Thoda natural baat karne ke liye
                stream=True
            )

            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    await asyncio.sleep(0.01)

        return StreamingResponse(event_generator(), media_type="text/plain")

    except Exception as e:
        return {"response": f"Error: {str(e)}"}
        # --- ENDPOINT 2: Description Generator ---
@app.post("/generate-listing-ai")
async def generate_listing(request: DescriptionRequest):
    try:
        gulf_countries = ["uae", "saudi", "riyadh", "dubai", "qatar", "kuwait", "bahrain", "oman", "abu dhabi", "jeddah"]
        is_gulf = any(word in request.location.lower() for word in gulf_countries)

        async def generate():
            prompt = f"""Write a professional real estate listing for {request.title} in {request.location}. 
            Features: {request.features}. {'Provide English and Arabic' if is_gulf else 'English ONLY'}. 
            No fillers, direct and royal tone."""

            # Stream=True se AI turant likhna shuru karega
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama3.1-8b",
                temperature=0.3,
                stream=True 
            )
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    await asyncio.sleep(0.01)

        return StreamingResponse(generate(), media_type="text/plain")
    except Exception as e:
        return {"error": str(e)}

# --- ENDPOINT 3: ROI Prediction (Optimized) ---
@app.post("/ai-roi-prediction")
async def predict_roi(data: ROIRequest):
    try:
        gulf_countries = ["uae", "saudi", "riyadh", "dubai", "qatar", "kuwait", "bahrain", "oman", "abu dhabi", "jeddah"]
        is_gulf = any(country.lower() in data.location.lower() for country in gulf_countries)
        lang_instruction = "Bilingual (English & Arabic)" if is_gulf else "English Only"

        async def generate_roi():
            prompt = f"""Expert Real Estate Analysis:
            Title: {data.title}, Location: {data.location}, Price: {data.price}, Features: {data.features}
            Instruction: {lang_instruction}
            Format: 1. Rental Yield, 2. 5-Year Appreciation, 3. Recommendation (BUY/HOLD/SELL)."""

            response = client.chat.completions.create(
                model="llama3.1-8b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5, # Thoda analytical logic ke liye 0.5 perfect hai
                stream=True
            )
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        return StreamingResponse(generate_roi(), media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
