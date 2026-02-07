🏰 Royal Estate: AI-Driven Property Investment Advisor
A Bilingual AI-Powered Real Estate Advisor built with React and FastAPI. Featuring real-time ROI forecasting and market insights for the GCC and Indian markets. It features a bilingual AI Advisor that moves beyond simple search, providing strategic ROI consultancy using Llama 3.1 and jais via Cerebras Cloud SDK.

🔗 Live & Deployment
🌐 Live Demo: [Royal Estate](https://my-royal-estate-app.vercel.app)

⚙️ API Endpoint: https://royal-estate-ai.onrender.com

📦 Frontend: Vercel | 📦 Backend: Render

🔥 Key Competitive Advantages
🤖 The Golden AI Advisor (Bilingual)
Unlike traditional search filters, our Advisor provides context-aware consultancy:

Bilingual Intelligence: Automatically switch between English and Arabic for Middle Eastern clients.

Economic Insights: Integrated knowledge of Saudi Vision 2030 and UAE real estate trends.

WhatsApp-Style UX: Minimalist golden interface with real-time typing indicators for a premium feel.

📈 Financial ROI Forecasting
5-Year Growth Logic: Proprietary-style algorithm to estimate capital appreciation.

Live Forex Sync: Real-time property valuation in SAR, AED, INR, and USD.

One-Click Analysis: Users get instant "Buy/Hold/Sell" recommendations from the AI.

🏗️ System Architecture
Our system is split into two optimized layers:

Frontend (Vercel): A React-based SPA focusing on high-speed user experience and state management.

AI Layer (Render): A FastAPI server managing Cerebras LLM calls, currency API fetching, and investment logic.

🛠️ Technical Stack
Core Stack: React.js (Vite), FastAPI (Python), MongoDB.

AI Engine: Llama 3.1-8b via Cerebras SDK (Inference speed optimized).

Styling: Tailwind CSS & Framer Motion (Royal Gold Theme).

APIs: ExchangeRate-API for real-time financial data.

Security: JWT (JSON Web Token) for stateless authentication.

🚀 Getting Started
1. Backend Setup
Bash
git clone https://github.com/Anam-Parwez-code/royal-estate.git
cd server
pip install -r requirements.txt
# Create .env with CEREBRAS_API_KEY & EXCHANGE_API_KEY
uvicorn main:app --reload
2. Frontend Setup
Bash
cd client
npm install
npm run dev
📱 Interface Preview
Note: Our interface follows a "Royal Gold & Midnight Slate" design system to reflect the luxury real estate market of Gulf Country and India.

👨‍💻 Developer & Contact
Anam Parwez Full-Stack Engineer | AI Solutions Architect
