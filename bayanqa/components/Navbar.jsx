// components/Navbar.js
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown, Search, X, Car, Briefcase, MessageCircleWarning, IdCard, PiggyBank, Bot, Building2, FileText, Loader2 } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const { setIsChatOpen } = useChat();
  const { language, t, isTranslating, switchToArabic, switchToEnglish } = useLanguage();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const langRef = useRef(null);

  // searchItems now use t() so they re-render when language changes
  const searchItems = [
    { title: t("Traffic & Accidents"), description: t("Fines, reports, insurance claims, and accident procedures."), href: "/services/traffic-accidents", icon: Car },
    { title: t("Business & Startups"), description: t("Register your company, navigate licenses, and launch your venture."), href: "/services/business-startup", icon: Briefcase },
    { title: t("Violations & Reports"), description: t("Report issues, appeal violations, or handle government complaints."), href: "/services/violations-reports", icon: MessageCircleWarning },
    { title: t("Document Renewals"), description: t("Renew passports, IDs, residency documents, and essential papers."), href: "/services/document-renewals", icon: IdCard },
    { title: t("Student Banking"), description: t("Open accounts, access student benefits, and banking options."), href: "/services/student-banking", icon: PiggyBank },
    { title: t("AI Virtual Advisor"), description: t("Tailored guidance across services and procedures."), href: null, icon: Bot },
    { title: t("Healthcare & Insurance"), description: t("Register for health insurance and access public healthcare."), href: "/services/healthcare-insurance", icon: Building2 },
    { title: t("Wills & Estate Planning"), description: t("Prepare a will, protect assets, and manage bank accounts."), href: "/services/wills-estate", icon: FileText },
  ];

  const filtered = query.trim() === ""
    ? searchItems
    : searchItems.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );

  const openSearch = () => { setQuery(""); setSearchOpen(true); };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") { setSearchOpen(false); setIsLangOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setIsLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen]);

  const handleLanguageSwitch = async (value) => {
    setIsLangOpen(false);
    if (value === "Arabic") await switchToArabic();
    else switchToEnglish();
  };

  return (
    <>
      <header className="site-navbar">
        <div className="site-navbar-inner">
          <Link href="/" className="site-logo-link">
  <Image
    src="/logo-new.png"
    alt="Bayan QA"
    width={80}
    height={80}
    className="site-logo"
  />
</Link>   

          <div className="navbar-controls">
            {/* Language selector */}
            <div className="language-selector" ref={langRef}>
              <button
                type="button"
                className="language-button"
                onClick={() => setIsLangOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={isLangOpen}
                disabled={isTranslating}
              >
                {isTranslating ? <Loader2 size={18} className="spin" /> : <Globe size={18} />}
                <span>{isTranslating ? "Translating…" : language}</span>
                <ChevronDown size={16} />
              </button>

              {isLangOpen && (
                <ul role="listbox" className="language-menu">
                  {[
                    { label: "English", value: "English" },
                    { label: "العربية", value: "Arabic" },
                  ].map((option) => (
                    <li key={option.value}>
                      <button
                        type="button"
                        className={`language-item${language === option.value ? " language-item--active" : ""}`}
                        onClick={() => handleLanguageSwitch(option.value)}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button type="button" className="search-trigger" onClick={openSearch} aria-label="Open search">
              <Search size={17} />
              <span className="search-trigger-text">{t("Search services…")}</span>
            </button>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div
          className="search-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
          role="dialog" aria-modal="true" aria-label="Search services"
        >
          <div className="search-modal">
            <div className="search-input-row">
              <Search size={20} className="search-input-icon" />
              <input
                ref={inputRef}
                type="text"
                className="search-input"
                placeholder={t("Search services…")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" className="search-close" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X size={20} />
              </button>
            </div>

            <p className="search-hint">
              {query.trim() === "" ? t("All services") : `${t("No results found for")} "${query}"`}
            </p>

            <ul className="search-results">
              {filtered.length > 0 ? (
                filtered.map((item) => {
                  const Icon = item.icon;
                  const lc = item.title.toLowerCase();
                  const lq = query.toLowerCase();
                  const idx = lc.indexOf(lq);
                  let titleNode;
                  if (query && idx !== -1) {
                    titleNode = (
                      <>
                        {item.title.slice(0, idx)}
                        <mark className="search-highlight">{item.title.slice(idx, idx + query.length)}</mark>
                        {item.title.slice(idx + query.length)}
                      </>
                    );
                  } else {
                    titleNode = item.title;
                  }

                  if (item.title === t("AI Virtual Advisor")) {
                    return (
                      <li key="ai-advisor">
                        <button
                          className="search-result-item"
                          onClick={() => { setSearchOpen(false); setIsChatOpen(true); }}
                          style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}
                        >
                          <div className="search-result-icon"><Icon size={20} /></div>
                          <div className="search-result-text">
                            <span className="search-result-title">{titleNode}</span>
                            <span className="search-result-desc">{item.description}</span>
                          </div>
                          <span className="search-result-arrow">→</span>
                        </button>
                      </li>
                    );
                  }

                  return (
                    <li key={item.href}>
                      <Link href={item.href} className="search-result-item" onClick={() => setSearchOpen(false)}>
                        <div className="search-result-icon"><Icon size={20} /></div>
                        <div className="search-result-text">
                          <span className="search-result-title">{titleNode}</span>
                          <span className="search-result-desc">{item.description}</span>
                        </div>
                        <span className="search-result-arrow">→</span>
                      </Link>
                    </li>
                  );
                })
              ) : (
                <li className="search-no-result">
                  <div className="search-no-result-inner">
                    <span className="search-no-result-emoji">🔍</span>
                    <p className="search-no-result-title">{t("No results found for")} <strong>"{query}"</strong></p>
                    <button type="button" className="search-no-result-reset" onClick={() => setQuery("")}>
                      {t("Clear and show all services")}
                    </button>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}