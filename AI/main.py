
import os
import json
import requests
from fastapi import FastAPI,HTTPException
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

# --- ENDPOINT 1: AI Chatbot ---
@app.post("/chat")
async def ask_ai(request: ChatRequest):
    global user_context
    try:
        user_msg = request.message
        rates = get_live_rates()

        # 1. AI detects Location, Currency AND Language
        extraction_prompt = f"""
        User Message: "{user_msg}"
        Identify: 
        1. location (city name)
        2. target currency (e.g. USD, INR, SAR, or none)
        3. language (is the user speaking Arabic, English, or Hindi?)
        Return ONLY valid JSON: {{"location": "city", "target_currency": "USD/none", "lang": "Arabic/English"}}
        """
        
        ex_res = client.chat.completions.create(
            messages=[{"role": "user", "content": extraction_prompt}],
            model="llama3.1-8b",
            temperature=0.1
        )
        
        content = ex_res.choices[0].message.content.strip()
        try:
            if "```" in content: content = content.split("```")[1].replace("json", "").strip()
            info = json.loads(content)
        except:
            info = {"location": None, "target_currency": "none", "lang": "English"}

        if info.get("location"): user_context["last_location"] = info["location"].lower()
        
        current_loc = user_context.get("last_location", "")
        target_curr = info.get("target_currency", "none")
        detected_lang = info.get("lang", "English")

        # 2. Database Fetch (Same as before)
        try:
            db_res = requests.get(LISTING_API_URL, timeout=8)
            all_listings = db_res.json()
        except: all_listings = []

        # 3. Filter & Price Logic
        matches = []
        for item in all_listings:
            search_pool = f"{item.get('name','')} {item.get('address','')} {item.get('description','')}".lower()
            if current_loc and current_loc in search_pool:
                orig_p = item.get('regularPrice', 0)
                
                if target_curr != "none":
                    try:
                        base = "INR" if "india" in item.get('address','').lower() else "SAR"
                        usd_val = float(orig_p) / rates.get(base, 1.0)
                        conv_p = round(usd_val * rates.get(target_curr.upper(), 1.0), 2)
                        final_price = f"{conv_p} {target_curr.upper()}"
                    except: final_price = f"{orig_p}"
                else:
                    final_price = f"{orig_p}"

                matches.append({
                    "name": item.get('name'),
                    "address": item.get('address'),
                    "price": final_price,
                    "link": f"{BASE_SITE_URL}/listing/{item.get('_id')}"
                })

        # 4. FINAL BILINGUAL SYSTEM PROMPT
       # --- 4. FINAL BILINGUAL SYSTEM PROMPT (Strict Version) ---
        system_prompt = f"""
        You are 'Royal Estate AI'. 
        User's Preferred Language: {detected_lang}.
        Location Context: {current_loc}.
        
        CRITICAL RULES:
        1. ONLY use properties from the DATA provided below.
        2. If the DATA list is empty [] or no matches are found, say: "I am sorry, we don't have any properties in this location in our database."
        3. DO NOT hallucinate or make up fake property names like 'Royal Greens' or fake prices.
        4. If the user asks for a location not in the DATA, strictly inform them that no listings are available.
        
        DATA: {json.dumps(matches[:3])}
        """
        
        final_res = client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_msg}],
            model="llama3.1-8b",
            temperature=0.1 # Isse AI "serious" rahega, bakwas nahi karega
        )
        
        # --- RETURN STRUCTURE (Very Important for React Cards) ---
        return {
            "response": final_res.choices[0].message.content,
            "results": matches[:3] 
        }
    except Exception as e:
        return {"response": f"Error: {str(e)}"}
# --- ENDPOINT 2: Description Generator ---
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

# --- ENDPOINT 3: ROI Prediction (Fixed) ---
@app.post("/ai-roi-prediction")
async def predict_roi(data: ROIRequest):
    try:
        # List of Gulf Countries
        gulf_countries = ["UAE", "United Arab Emirates", "Saudi Arabia", "KSA", "Qatar", "Kuwait", "Bahrain", "Oman", "Dubai", "Abu Dhabi", "Riyadh"]
        
        # Check if location is in Gulf
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
