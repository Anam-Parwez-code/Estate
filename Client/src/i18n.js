import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector) // Browser ki language detect karne ke liye
  .use(initReactI18next) // React ke saath jodne ke liye
  .init({
    debug: false,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, 
    },
    resources: {
      en: {
        translation: {
          nav_home: "Home",
          nav_about: "About",
          nav_search: "Search",
          btn_contact: "Contact Landlord",
          search_placeholder: "Search for luxury villas...",
          type_rent: "Rent",
          type_sale: "Sale",
          currency_label: "Price in",
          ai_assistant: "Royal AI Assistant",
          welcome_msg: "Find your next royal home"
        }
      },
      ar: {
        translation: {
          nav_home: "الصفحة الرئيسية",
          nav_about: "من نحن",
          nav_search: "البحث",
          btn_contact: "اتصل بالمالك",
          search_placeholder: "ابحث عن فيلات فاخرة...",
          type_rent: "إيجار",
          type_sale: "بيع",
          currency_label: "السعر بـ",
          ai_assistant: "مساعد الذكاء الاصطناعي الملكي",
          welcome_msg: "ابحث عن منزلك الملكي القادم"
        }
      }
    }
  });

export default i18n;