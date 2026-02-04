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

        # 1. Extraction Call (Roman English handles karne ke liye instruction di hai)
        extraction_prompt = f"""
        User Message: "{user_msg}"
        Previous Location: "{user_context.get('last_location', 'None')}"
        Instruction: Understand Arabic, English and Roman English (e.g. "Riyadh me"). 
        Return JSON ONLY: {{"location": "Name/null", "currency": "INR/AED/SAR/null", "lang": "Arabic/English"}}
        """
        
        ex_res = client.chat.completions.create(
            messages=[{"role": "user", "content": extraction_prompt}],
            model="llama3.1-8b", # Fast extraction
            temperature=0
        )
        
        content = ex_res.choices[0].message.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        info = json.loads(content.strip())

        # Logic for location & currency
        new_loc = info.get("location")
        if new_loc and new_loc.lower() not in ["none", "null"]:
            user_context["last_location"] = new_loc.lower()
        
        current_loc = user_context.get("last_location", "")
        target_curr = info.get("currency")
        user_lang = info.get("lang", "English")

        # 2. Database Fetch (Ensure this endpoint exists in Node.js)
        try:
            db_res = requests.get("[https://royal-estate-uzii.onrender.com/api/listing/get-all-chatbot](https://royal-estate-uzii.onrender.com/api/listing/get-all-chatbot)", timeout=5)
            all_listings = db_res.json()
        except:
            all_listings = []

        matches = []
        for item in all_listings:
            search_pool = f"{item.get('name','')} {item.get('address','')} {item.get('description','')}".lower()
            
            if current_loc and current_loc in search_pool:
                orig_p = item.get('regularPrice', 0)
                # Base currency detect (Default SAR)
                base_curr = "SAR" 
                
                price_val = f"{orig_p} {base_curr}"
                if target_curr and target_curr != "null" and target_curr != base_curr:
                    # Conversion logic: (Price / BaseRate) * TargetRate
                    usd_val = orig_p / rates.get(base_curr, 3.75)
                    conv_p = round(usd_val * rates.get(target_curr, 1.0), 2)
                    price_val += f" | {conv_p} {target_curr}"

                matches.append({
                    "n": item.get('name'),
                    "a": item.get('address'),
                    "p": price_val,
                    "i": item.get('imageUrls', [''])[0],
                    "u": f"{BASE_SITE_URL}/listing/{item.get('_id')}"
                })

        # 3. Final Bilingual Response with JAIS
        system_prompt = f"""
        You are 'Royal Estate AI', a bilingual real estate expert. 
        - Language to use: {user_lang}.
        - Understand Roman English/Hindi/Arabic.
        - If DATA is found, display as HTML cards. 
        - Important: Use dir="rtl" and text-align: right for Arabic.
        
        HTML Card Template:
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin-bottom: 15px; background: white; color: #1e293b; text-align: {'right' if user_lang == 'Arabic' else 'left'}; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" dir="{'rtl' if user_lang == 'Arabic' else 'ltr'}">
          <img src="VALUE_I" style="width: 100%; border-radius: 8px; height: 160px; object-fit: cover; margin-bottom: 8px;" />
          <h4 style="margin: 0; color: #1e40af;">VALUE_N</h4>
          <p style="font-size: 13px; margin: 5px 0;">📍 {'الموقع' if user_lang == 'Arabic' else 'Location'}: VALUE_A</p>
          <p style="font-weight: bold; color: #059669;">💰 {'السعر' if user_lang == 'Arabic' else 'Price'}: VALUE_P</p>
          <a href="VALUE_U" target="_blank" style="display: block; text-align: center; background: #1e40af; color: white; padding: 8px; border-radius: 6px; text-decoration: none; font-size: 14px; margin-top: 10px;">{'عرض التفاصيل' if user_lang == 'Arabic' else 'View Details'}</a>
        </div>
        
        DATA: {json.dumps(matches[:3])} 
        """

        final_res = client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_msg}],
            model="jais-30b-chat", # <-- JAIS Model
            temperature=0.3
        )

        return {"reply": final_res.choices[0].message.content}

    except Exception as e:
        print(f"Error: {e}")
        return {"reply": "Sorry, I am unable to fetch property details right now."}
