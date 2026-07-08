// context/LanguageContext.js
import React, { createContext, useContext, useState, useCallback, useRef } from "react";

const LanguageContext = createContext(null);

// All static UI strings across your site — add more as needed
export const UI_STRINGS = {
  // Navbar
  "Search services…": true,
  "All services": true,
  'Clear and show all services': true,
  "No results found for": true,

  // Search item titles & descriptions
  "Traffic & Accidents": true,
  "Fines, reports, insurance claims, and accident procedures.": true,
  "Business & Startups": true,
  "Register your company, navigate licenses, and launch your venture.": true,
  "Violations & Reports": true,
  "Report issues, appeal violations, or handle government complaints.": true,
  "Document Renewals": true,
  "Renew passports, IDs, residency documents, and essential papers.": true,
  "Student Banking": true,
  "Open accounts, access student benefits, and banking options.": true,
  "AI Virtual Advisor": true,
  "Tailored guidance across services and procedures.": true,
  "Healthcare & Insurance": true,
  "Register for health insurance and access public healthcare.": true,
  "Wills & Estate Planning": true,
  "Prepare a will, protect assets, and manage bank accounts.": true,

  // Homepage hero
"Fast and clear government guidance in Arabic and English": true,
"Navigate procedures, documents, and public services with confidence using a single platform built for your everyday needs.": true,

// Feature cards
"Everything You Need, in One Place": true,
"Everything You Need in One Place": true,
"AI Assistant": true,
"Ask questions in plain Arabic or English and receive clear, step-by-step guidance tailored to your situation. No jargon, no confusion.": true,
"Service Guides": true,
"Easy-to-follow instructions for every government procedure, including required documents, relevant offices, and links to official portals.": true,
"See services →": true,
"Citizen Feedback": true,
"View live analytics on what citizens ask about and how satisfied they are.":true,

// Services section
"SERVICES": true,
"Find What You Need": true,
"Get help with fines, reports, insurance claims, and accident procedures.": true,
"Register your company, navigate licenses, and launch your new venture with confidence.": true,
"Report issues, appeal violations, or learn how to handle government complaints properly.": true,
"Renew passports, IDs, residency documents, and other essential papers without the guesswork.": true,
"Open accounts, access student benefits, and understand banking options for students.": true,
"Ask the virtual advisor for tailored guidance across services and procedures.": true,
"Register for health insurance, find approved providers, and access public healthcare services.": true,
"Prepare a will, protect your assets, and ensure your bank accounts are properly managed.": true,


// Footer
"Simplifying access to government services and information for residents and citizens of Qatar.": true,
"Quick Links": true,
"Home": true,
"AI Assistant": true,  // already there if you added homepage strings
"Government Services": true,
"About": true,
"Contact": true,
"Trusted Sources": true,
"Hukoomi": true,
"Ministry of Interior": true,
"Ministry of Justice": true,
"Ministry of Public Health": true,
"Disclaimer": true,
"This platform provides AI-assisted guidance based on publicly available government information. Always verify important information with the official government authority before taking action.": true,
"All rights reserved.": true,
"AI Powered": true,
"Gov Verified": true,
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("English"); // "English" | "Arabic"
  const [translations, setTranslations] = useState({}); // cache: { [english]: arabic }
  const [isTranslating, setIsTranslating] = useState(false);
  const translationCache = useRef({});

const switchToArabic = useCallback(async () => {
  setIsTranslating(true);

  const allStrings = Object.keys(UI_STRINGS);
  const untranslated = allStrings.filter((s) => !translationCache.current[s]);

  let newCache = { ...translationCache.current };

  if (untranslated.length > 0) {
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: untranslated }),
      });
      const data = await res.json();

      if (data.translations) {
        untranslated.forEach((str, i) => {
          newCache[str] = data.translations[i];
        });
        translationCache.current = newCache;
      }
    } catch (err) {
      console.error("Failed to load translations:", err);
    }
  }

  // Set both in one flush so React re-renders once with both values ready
  setTranslations(newCache);
  setLanguage("Arabic");
  setIsTranslating(false);

  document.documentElement.dir = "rtl";
  document.documentElement.lang = "ar";
}, []);

  const switchToEnglish = useCallback(() => {
    setLanguage("English");
    document.documentElement.dir = "ltr";
    document.documentElement.lang = "en";
  }, []);

  // t() = translate function — use everywhere in your components
  const t = useCallback(
    (str) => {
      if (language === "Arabic" && translations[str]) {
        return translations[str];
      }
      return str;
    },
    [language, translations]
  );

  return (
    <LanguageContext.Provider
      value={{ language, t, isTranslating, switchToArabic, switchToEnglish }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}