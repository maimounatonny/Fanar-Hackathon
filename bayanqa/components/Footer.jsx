import React from 'react';
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  const quickLinks = [
    { label: t('Home'),                href: '/' },
    { label: t('AI Assistant'),        href: '/assistant' },
    { label: t('Government Services'), href: '/services' },
    { label: t('About'),               href: '/about' },
    { label: t('Contact'),             href: '/contact' },
  ];

  const trustedSources = [
    { label: t('Hukoomi'),                   href: 'https://hukoomi.gov.qa' },
    { label: t('Ministry of Interior'),   href: 'https://portal.moi.gov.qa' },
    { label: t('Ministry of Justice'),    href: 'https://www.moj.gov.qa' },
    { label: t('Ministry of Public Health'), href: 'https://www.moph.gov.qa' },
  ];

  return (
    <footer className="qca-footer">
      <div className="qca-footer-inner">

        {/* ── Top grid ── */}
        <div className="qca-footer-grid">

          {/* Brand */}
          <div>
            <p className="qca-brand-name">
              <span className="qca-brand-dot" aria-hidden="true" />
              bayan QA
            </p>
            <p className="qca-brand-desc">
              {t("Simplifying access to government services and information for residents and citizens of Qatar.")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="qca-col-title">{t("Quick Links")}</p>
            <ul className="qca-link-list">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Trusted Sources */}
          <div>
            <p className="qca-col-title">{t("Trusted Sources")}</p>
            <ul className="qca-link-list">
              {trustedSources.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <p className="qca-col-title">{t("Disclaimer")}</p>
            <div className="qca-disclaimer">
              <p>
                {t("This platform provides AI-assisted guidance based on publicly available government information. Always verify important information with the official government authority before taking action.")}
              </p>
            </div>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="qca-footer-bottom">
          <p className="qca-copyright">
            © 2026 <span>bayan QA</span>. {t("All rights reserved.")}
          </p>
          <div className="qca-badges">
            <span className="qca-badge">{t("AI Powered")}</span>
            <span className="qca-badge">{t("Gov Verified")}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}