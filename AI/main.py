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

client = Cerebras(api_key=CEREBRAS_KEY)

def get_live_rates():
    try:
        url = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_KEY}/latest/USD"
        res = requests.get(url, timeout=5).json()
        return res.get('conversion_rates', {})
    except:
        return {"SAR": 3.75, "INR": 83.5, "AED": 3.67, "USD": 1.0}

class ChatRequest(BaseModel):
    message: str

user_context = {"last_location": "", "last_language": "English"}

@app.post("/chat")
async def ask_ai(request: ChatRequest):
    global user_context
    try:
        user_msg = request.message
        rates = get_live_rates()

        # 1. Extraction: Roman English se kachra saaf karke sirf City nikalna
        extraction_prompt = f"""
        User Message: "{user_msg}"
        Rules:
        - Extract ONLY the city name (e.g., from "Riyadh me ghar" extract "Riyadh").
        - If currency mentioned (INR/SAR/AED), extract it.
        - Detect Language (Arabic/English).
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
            search_pool = f"{item.get('name','')} {item.get('address','')} {item.get('description','')}".lower()
            
            if current_loc and current_loc in search_pool:
                orig_p = item.get('regularPrice', 0)
                address_lower = item.get('address', '').lower()

                # --- SMART CURRENCY DETECTION ---
                # Listing ke address se base currency pata lagana
                if any(x in address_lower for x in ["india", "bangalore", "mumbai"]):
                    actual_base = "INR"
                elif any(x in address_lower for x in ["uk", "london"]):
                    actual_base = "GBP"
                else:
                    actual_base = "SAR"
                
                price_display = f"{orig_p} {actual_base}"
                
                # Agar user ne conversion maangi ho
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
        You are 'Royal Estate AI'. 
        If user_lang is 'Arabic', respond in Arabic. Else English.
        Current Location: {current_loc}.
        If DATA is empty, say "No properties found in {current_loc}" politely.
        If DATA has items, describe them briefly and show the HTML cards.
        
        HTML Template:
        <div style="border: 1px solid #334155; border-radius: 12px; padding: 12px; margin-bottom: 15px; background: #1e293b; color: white; text-align: {'right' if user_lang == 'Arabic' else 'left'};" dir="{'rtl' if user_lang == 'Arabic' else 'ltr'}">
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
            model="jais-30b-chat",
            temperature=0.3
        )

        return {"reply": final_res.choices[0].message.content}

    except Exception as e:
        return {"reply": "An error occurred. Please try again."}
