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

# CORS Fix for Vercel/Local
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_methods=["*"], 
    allow_headers=["*"]
)

# --- CONFIGURATION ---
CEREBRAS_KEY = os.getenv("CEREBRAS_API_KEY")
EXCHANGE_KEY = os.getenv("EXCHANGE_API_KEY")
# LIVE SITE URL (Localhost ki jagah ye use hoga)
BASE_SITE_URL = "https://my-royal-estate-app.vercel.app" 

client = Cerebras(api_key=CEREBRAS_KEY)

def get_live_rates():
    try:
        url = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_KEY}/latest/USD"
        res = requests.get(url, timeout=5).json()
        return res.get('conversion_rates', {})
    except Exception as e:
        print(f"Currency API Error: {e}")
        return {"SAR": 3.75, "INR": 83.5, "AED": 3.67, "USD": 1.0}

class ChatRequest(BaseModel):
    message: str

# In-memory context (Note: Har user ke liye alag nahi hoga jab tak Session ID na use karein)
user_context = {"last_location": "", "last_language": "English"}

@app.post("/chat")
async def ask_ai(request: ChatRequest):
    global user_context
    try:
        user_msg = request.message
        rates = get_live_rates()

        # 1. Extraction: Roman/Arabic se sirf CITY aur CURRENCY nikalne ke liye
        extraction_prompt = f"""
        User Message: "{user_msg}"
        Identify:
        1. City/Location: (Extract only the name, e.g., 'Riyadh' from 'Riyadh me ghar')
        2. Currency: (INR/SAR/AED/USD/null)
        3. Language: (Arabic/English)
        
        Return JSON ONLY: {{"location": "CityName", "currency": "Code/null", "lang": "Arabic/English"}}
        """
        
        ex_res = client.chat.completions.create(
            messages=[{"role": "user", "content": extraction_prompt}],
            model="llama3.1-8b", 
            temperature=0
        )
        
        content = ex_res.choices[0].message.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        info = json.loads(content.strip())

        # Logic updates
        new_loc = info.get("location")
        if new_loc and new_loc.lower() not in ["none", "null"]:
            user_context["last_location"] = new_loc.lower()
        
        current_loc = user_context.get("last_location", "")
        target_curr = info.get("currency")
        user_lang = info.get("lang", "English")

        # 2. Database Fetch
        try:
            db_res = requests.get("[https://royal-estate-uzii.onrender.com/api/listing/get-all-chatbot](https://royal-estate-uzii.onrender.com/api/listing/get-all-chatbot)", timeout=5)
            all_listings = db_res.json()
        except:
            all_listings = []

        matches = []
        for item in all_listings:
            # Search pool for Riyadh/Bangalore etc.
            search_pool = f"{item.get('name','')} {item.get('address','')} {item.get('description','')}".lower()
            
            if current_loc and current_loc in search_pool:
                orig_p = item.get('regularPrice', 0)
                address_lower = item.get('address', '').lower()

                # --- SMART BASE CURRENCY DETECTION ---
                # Agar address mein India hai toh INR, varna default SAR
                if any(city in address_lower for city in ["india", "bangalore", "mumbai", "delhi"]):
                    actual_base = "INR"
                elif any(city in address_lower for city in ["uk", "london"]):
                    actual_base = "GBP"
                else:
                    actual_base = "SAR"
                
                # Default display
                price_display = f"{orig_p} {actual_base}"
                
                # --- CONVERSION LOGIC ---
                # Agar user ne specific currency mangi ho (Target Currency)
                if target_curr and target_curr != "null" and target_curr != actual_base:
                    try:
                        # (Price / BaseRate) * TargetRate
                        usd_val = orig_p / rates.get(actual_base, 1.0)
                        conv_p = round(usd_val * rates.get(target_curr, 1.0), 2)
                        price_display = f"{conv_p} {target_curr}"
                    except:
                        pass # API rate na mile toh original dikhao

                matches.append({
                    "n": item.get('name'),
                    "a": item.get('address'),
                    "p": price_display, # Yahan fix ho gaya SAR/INR confusion
                    "i": item.get('imageUrls', [''])[0],
                    "u": f"{BASE_SITE_URL}/listing/{item.get('_id')}"
                })

        # 3. Final Bilingual Response with JAIS
        system_prompt = f"""
        You are 'Royal Estate AI'.
        - If user speaks Arabic, reply in Arabic.
        - If user speaks English/Roman English, reply in English.
        - Use the provided DATA to show property cards.
        - Current Language: {user_lang}.
        
        DATA: {json.dumps(matches[:3])}
        """

        final_res = client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_msg}],
            model="jais-30b-chat",
            temperature=0.3
        )

        return {"reply": final_res.choices[0].message.content}

    except Exception as e:
        print(f"Error: {e}")
        return {"reply": "I'm having trouble connecting to my royal records."}
