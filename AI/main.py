
import os
import json
import requests
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from cerebras.cloud.sdk import Cerebras 
from dotenv import load_dotenv

# .env file se variables load karne ke liye
load_dotenv()
app = FastAPI()

# Frontend connection
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# --- CONFIGURATION ---

CEREBRAS_KEY = os.getenv("CEREBRAS_API_KEY")
EXCHANGE_KEY = os.getenv("EXCHANGE_API_KEY") # Apni key yahan dalein
client = Cerebras(api_key=CEREBRAS_KEY)
def get_live_rates():
    try:
        # Hum USD ko base man kar saare rates le rahe hain
        url = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_KEY}/latest/USD"
        res = requests.get(url, timeout=5).json()
        return res.get('conversion_rates', {})
    except Exception as e:
        print(f"Currency API Error: {e}")
        return {"SAR": 3.75, "INR": 83.5, "EUR": 0.92, "USD": 1.0}

class ChatRequest(BaseModel):
    message: str



user_context = {"last_location": "", "last_language": "English"}

@app.post("/chat")
async def ask_ai(request: ChatRequest):
    global user_context
    try:
        user_msg = request.message
        # 1. LIVE RATES FETCH KARNA (Sabse zaroori fix)
        rates = get_live_rates()

        # 2. AI Extraction Call
        extraction_prompt = f"""
        User Message: "{user_msg}"
        Previous Location: "{user_context.get('last_location', 'None')}"
        Return JSON ONLY: {{"location": "Name", "currency": "INR/USD/SAR/null", "lang": "Arabic/English"}}
        """
        
        ex_res = client.chat.completions.create(
            messages=[{"role": "user", "content": extraction_prompt}],
            model="llama-3.1-8b",
            temperature=0
        )
        
        content = ex_res.choices[0].message.content
        # JSON clean up logic taaki internal error na aaye
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        info = json.loads(content.strip())

        # 3. Logic Updates
        new_loc = info.get("location")
        if new_loc and new_loc.lower() not in ["none", "null", "context"]:
            user_context["last_location"] = new_loc.lower()
        
        current_loc = user_context.get("last_location", "")
        target_curr = info.get("currency")
        user_lang = info.get("lang", "English")

        # 4. Database Fetch
        try:
            db_res = requests.get("http://localhost:3000/api/listing/get-all-chatbot", timeout=5)
            all_listings = db_res.json()
        except:
            all_listings = [] # Agar backend off hai toh khali list

        matches = []
        for item in all_listings:
            search_pool = f"{item.get('name','')} {item.get('address','')} {item.get('description','')}".lower()
            
            if current_loc and current_loc in search_pool:
                orig_p = item.get('regularPrice', 0)
                # Simple logic for base currency
                base_curr = "EUR" if any(x in search_pool for x in ["uk", "london", "europe"]) else "SAR"
                
                price_val = f"{orig_p} {base_curr}"
                if target_curr and target_curr != "null" and target_curr != base_curr:
                    # Conversion logic with safety check
                    usd_val = orig_p / rates.get(base_curr, 3.75)
                    conv_p = round(usd_val * rates.get(target_curr, 1.0), 2)
                    price_val += f" | {conv_p} {target_curr}"

                matches.append({
                    "n": item.get('name'),
                    "a": item.get('address'),
                    "p": price_val,
                    "i": item.get('imageUrls', [''])[0],
                    "u": f"http://localhost:5173/listing/{item.get('_id')}"
                })

        # 5. Final UI Response
        system_prompt = f"""
        You are 'Royal Estate AI'. 
        Language: {user_lang}.
        Dir: {'rtl' if user_lang == 'Arabic' else 'ltr'}.
        If DATA has items, use the HTML card format provided.
        If DATA is empty, inform the user kindly.
        
        HTML Template:
        <div style="border: 1px solid #334155; border-radius: 12px; padding: 12px; margin-bottom: 15px; background: #1e293b; color: white; text-align: {'right' if user_lang == 'Arabic' else 'left'};" dir="{'rtl' if user_lang == 'Arabic' else 'ltr'}">
          <img src="VALUE_I" style="width: 100%; border-radius: 8px; height: 150px; object-fit: cover; margin-bottom: 8px;" />
          <h4 style="margin: 0; color: #fbbf24;">VALUE_N</h4>
          <p style="font-size: 13px; margin: 5px 0;">📍 {'الموقع' if user_lang == 'Arabic' else 'Location'}: VALUE_A</p>
          <p style="font-weight: bold;">💰 {'السعر' if user_lang == 'Arabic' else 'Price'}: VALUE_P</p>
          <a href="VALUE_U" style="display: block; text-align: center; background: #fbbf24; color: black; padding: 10px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">{'عرض التفاصيل' if user_lang == 'Arabic' else 'View Details'}</a>
        </div>
        
        DATA: {json.dumps(matches)}
        """

        final_res = client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_msg}],
            model="llama-3.3-70b",
            temperature=0.1
        )

        return {"reply": final_res.choices[0].message.content}

    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        return {"reply": "I'm having trouble connecting to my royal records. Please try again."}