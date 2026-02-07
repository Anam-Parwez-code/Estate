🏰 Royal Estate: AI-Powered Real Estate Investment Platform
Royal Estate is a premium, full-stack property investment platform designed for the Middle Eastern and Indian markets. It features a bilingual AI Investment Advisor that provides strategic market insights and automated ROI projections.

🚀 Key Features
🤖 1. Royal AI Advisor (Bilingual)
Expert Consulting: Integrated with Cerebras Cloud SDK (Llama 3.1) and (Jais) for ultra-fast, data-driven real estate advice.

Bilingual Support: Automatically detects and responds in both Arabic and English, catering to the GCC market.

Market Intelligence: Provides insights into Saudi Vision 2030, UAE tourism trends, and Indian tech-hub growth.

📈 2. Smart ROI Engine
5-Year Projections: Predicts rental yields and capital appreciation based on property location and features.

Live Currency Conversion: Real-time exchange rates for SAR, AED, INR, and USD using ExchangeRate API.

Advisor Mode: Dedicated "Advisor" interface focusing on strategic consultancy over simple search.

🔐3. Enterprise-Grade Security & UIAuthentication: 
Secure user onboarding using JWT (JSON Web Tokens).
Premium UI: A high-end "Royal" theme built with Tailwind CSS and Framer Motion for smooth animations.
Responsive Design: Fully optimized for mobile and desktop investment tracking.
🛠️ Tech StackLayerTechnologies
FrontendReact.js, Tailwind CSS, ViteBackendFastAPI (Python), Node.js, ExpressDatabaseMongoDB (Atlas)AI/LLMCerebras Cloud SDK, Llama 3.1-8bDeploymentRender (Backend), Vercel (Frontend)
⚙️ Installation & Setup
Clone the repository:
Bash
git clone https://github.com/Anam-Parwez/royal-estate.git
Backend Setup:

Create a .env file in the server directory.

Add CEREBRAS_API_KEY and EXCHANGE_API_KEY.

Run: pip install -r requirements.txt

Start server: uvicorn main:app --reload

Frontend Setup:

Run: npm install
Start app: npm run dev
👨‍💻 Author
Anam Parwez

Full-Stack Developer | AI Enthusiast

Focus: Scalable AI solutions for Real Estate
🔗 Live DeploymentPlatformURL
🌐 Live Applicationhttps:[Royal Estate.com](https://my-royal-estate-app.vercel.app)
