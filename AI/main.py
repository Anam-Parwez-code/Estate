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

        # 1. Extraction with Strict Instruction
        extraction_prompt = f"""
        User Message: "{user_msg}"
        Identify: location, currency, and language.
        Return ONLY valid JSON like: {{"location": "riyadh", "currency": "USD", "lang": "English"}}
        Do not include any extra text.
        """
        
        ex_res = client.chat.completions.create(
            messages=[{"role": "user", "content": extraction_prompt}],
            model="llama3.1-8b",
            temperature=0.1
        )
        
        content = ex_res.choices[0].message.content.strip()

        # --- FIX: JSON Cleaning Logic ---
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        try:
            info = json.loads(content)
        except:
            # Fallback agar AI ne kachra bheja
            info = {"location": "riyadh" if "riyadh" in user_msg.lower() else None, 
                    "currency": "USD" if "usd" in user_msg.lower() else None, 
                    "lang": "English"}

        new_loc = info.get("location")
        if new_loc and str(new_loc).lower() not in ["none", "null"]:
            user_context["last_location"] = new_loc.lower()
        
        current_loc = user_context.get("last_location", "")
        target_curr = info.get("currency")
        user_lang = info.get("lang", "English")

        # 2. Database Fetch
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
                actual_base = "SAR" # Default base
                
                # --- FIX: Price Display Logic ---
                price_display = f"{orig_p} {actual_base}"
                
                # Check if conversion is needed
                if target_curr and str(target_curr).lower() not in ["none", "null", actual_base.lower()]:
                    try:
                        # Convert to USD first then to Target (Assuming rates are relative to USD)
                        usd_val = orig_p / rates.get(actual_base, 3.75)
                        conv_p = round(usd_val * rates.get(target_curr.upper(), 1.0), 2)
                        price_display = f"{conv_p} {target_curr.upper()}"
                    except:
                        pass

                matches.append({
                    "n": item.get('name'),
                    "a": item.get('address'),
                    "p": price_display,
                    "i": item.get('imageUrls', [''])[0],
                    "u": f"{BASE_SITE_URL}/listings/{item.get('_id')}"
                })

        # 3. Final Response using the HTML template
        system_prompt = f"You are 'Royal Estate AI'. Response Language: {user_lang}. Show properties in the provided HTML format only. DATA: {json.dumps(matches[:3])}"

        final_res = client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_msg}],
            model="llama3.1-8b",
            temperature=0.3
        )
        return {"reply": final_res.choices[0].message.content}

    except Exception as e:
        print(f"Error: {e}")
        return {"reply": "I apologize, but I'm having trouble retrieving the listings right now. Please try again in a moment."}
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
# ROI Analysis Endpoint
@app.post("/ai-roi-analysis") # Aap chahein toh yahan /api laga sakte hain identify karne ke liye
async def get_roi_analysis(request: ROIRequest):
    try:
        prompt = f"""
        Act as a Real Estate Consultant for {request.location}.
        Property: {request.title}
        Price: {request.price} SAR
        Features: {request.features}

        Analyze:
        1. Rental Yield % (Estimated)
        2. 5-Year Appreciation potential
        3. Recommendation (Buy/Hold/Avoid)
        
        Keep it professional and short.
        """
        
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3.1-8b",
            temperature=0.5
        )
        return {"analysis": response.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
