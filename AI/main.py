import os
import json
import requests
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# CORS setup taaki Vercel se request block na ho
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
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

# --- MODELS ---
class ChatRequest(BaseModel):
    message: str

class DescriptionRequest(BaseModel):
    title: str
    features: str
    location: str

user_context = {"last_location": "", "last_language": "English"}

# --- ENDPOINT 1: AI Chatbot (Existing + Fixed) ---
@app.post("/chat")
async def ask_ai(request: ChatRequest):
    global user_context
    try:
        user_msg = request.message
        rates = get_live_rates()

        # 1. Extraction using Llama (Fast & Cheap for logic)
        extraction_prompt = f"""
        User Message: "{user_msg}"
        Return JSON ONLY: {{"location": "CityName", "currency": "Code/null", "lang": "Arabic/English"}}
        """
        
        ex_res = client.chat.completions.create(
            messages=[{"role": "user", "content": extraction_prompt}],
            model="llama3.1-8b",
            temperature=0.1
        )
        
        content = ex_res.choices[0].message.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        info = json.loads(content.strip())

        new_loc = info.get("location")
        if new_loc and str(new_loc).lower() not in ["none", "null"]:
            user_context["last_location"] = new_loc.lower()
        
        current_loc = user_context.get("last_location", "")
        target_curr = info.get("currency")
        user_lang = info.get("lang", "English")

        # 2. Database Fetch (Fixed URL)
        try:
            db_res = requests.get(LISTING_API_URL, timeout=8)
            all_listings = db_res.json()
        except:
            all_listings = []

        matches = []
        for item in all_listings:
            search_pool = f"{item.get('name','')} {item.get('address','')} {item.get('description','')}".lower()
            if current_loc and current_loc in search_pool:
                orig_p = item.get('regularPrice', 0)
                address_lower = item.get('address', '').lower()

                # Base Currency Detection
                actual_base = "SAR"
                if any(x in address_lower for x in ["india", "bangalore"]): actual_base = "INR"
                elif any(x in address_lower for x in ["uk", "london"]): actual_base = "GBP"
                
                price_display = f"{orig_p} {actual_base}"
                if target_curr and target_curr != "null" and target_curr != actual_base:
                    try:
                        usd_val = orig_p / rates.get(actual_base, 1.0)
                        conv_p = round(usd_val * rates.get(target_curr, 1.0), 2)
                        price_display = f"{conv_p} {target_curr}"
                    except: pass

                matches.append({
                    "n": item.get('name'),
                    "a": item.get('address'),
                    "p": price_display,
                    "i": item.get('imageUrls', [''])[0],
                    "u": f"{BASE_SITE_URL}/listing/{item.get('_id')}"
                })

        # 3. JAIS Final Response (Bilingual)
        system_prompt = f"""
        You are 'Royal Estate AI'. Response Language: {user_lang}.
        If DATA is empty, apologize politely. If DATA has items, show them using the HTML Template.
        
        HTML Template:
        <div style="border: 1px solid #334155; border-radius: 12px; padding: 12px; margin-bottom: 15px; background: #1e293b; color: white;">
          <img src="VALUE_I" style="width: 100%; border-radius: 8px; height: 140px; object-fit: cover;" />
          <h4 style="margin: 8px 0; color: #fbbf24;">VALUE_N</h4>
          <p style="font-size: 12px;">📍 VALUE_A</p>
          <p style="font-weight: bold;">💰 VALUE_P</p>
          <a href="VALUE_U" target="_blank" style="display: block; text-align: center; background: #fbbf24; color: black; padding: 8px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">Details</a>
        </div>
        
        DATA: {json.dumps(matches[:3])}
        """

        final_res = client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_msg}],
            model="llama3.1-8b",
            temperature=0.1
        )
        return {"reply": final_res.choices[0].message.content}

    except Exception as e:
        return {"reply": f"Marhaba! I am facing a connection issue. Error: {str(e)}"}

# --- ENDPOINT 2: Bilingual Content Generator (G42 Special) ---
@app.post("/generate-listing-ai")
async def generate_listing(request: DescriptionRequest):
    try:
        # Gulf location check
        gulf_countries = ["uae", "saudi", "riyadh", "dubai", "qatar", "kuwait", "bahrain", "oman", "abu dhabi", "jeddah"]
        is_gulf = any(word in request.location.lower() for word in gulf_countries)

        if is_gulf:
            prompt = f"""
            Write a professional luxury real estate listing for {request.title} in {request.location}.
            Features: {request.features}.
            Format: Provide English first, then Arabic. 
            Strictly NO notes, NO apologies, and NO conversational filler. 
            Just the descriptions.
            """
        else:
            prompt = f"""
            Write a professional luxury real estate listing for {request.title} in {request.location}.
            Features: {request.features}.
            Format: Provide the description in English ONLY.
            Strictly NO Arabic, NO notes, and NO conversational filler.
            """

        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3.1-8b",
            temperature=0.3
        )
        return {"content": response.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
