import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Globe, Sun, Moon, X } from 'lucide-react'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'
import { useSiteSettings } from '../../context/SiteSettingsContext.jsx'

const NAV_LINKS_EN = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Services', href: '#services' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

const NAV_LINKS_AR = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'عنّي', href: '#about' },
  { label: 'المهارات', href: '#skills' },
  { label: 'المشاريع', href: '#projects' },
  { label: 'الخدمات', href: '#services' },
  { label: 'الخبرات', href: '#experience' },
  { label: 'تواصل', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, lang, toggleTheme, toggleLang } = useThemeLanguage()
  const { visibility } = useSiteSettings()

  const rawLinks = lang === 'ar' ? NAV_LINKS_AR : NAV_LINKS_EN
  const links = rawLinks.filter((item) => {
    const sectionKey = item.href.replace('#', '')
    if (sectionKey === 'home') return visibility?.hero !== false
    return visibility?.[sectionKey] !== false
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      // Update active section
      const sections = links.map((l) => l.href.replace('#', ''))
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(id)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [links])

  const scrollTo = (href) => {
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileOpen(false)
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="nav-inner">
            {/* Logo */}
            <button
              onClick={() => scrollTo('#home')}
              className="nav-logo"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              aria-label="Hamza Eshtiba Home"
            >
              <img
                src="/logo.png"
                alt="Hamza Eshtiba Logo"
                className="nav-logo-img"
              />
            </button>

            {/* Desktop Links */}
            <ul className="nav-links">
              {links.map(({ label, href }) => (
                <li key={href}>
                  <button
                    className={`nav-link ${active === href.replace('#', '') ? 'active' : ''}`}
                    onClick={() => scrollTo(href)}
                    style={{ background: 'none', border: 'none' }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Action Buttons: Language, Theme Mode, Settings */}
            <div className="nav-actions-group">
              {/* Language Switcher */}
              <button
                className="nav-action-pill-btn"
                onClick={toggleLang}
                title={lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
                aria-label="Toggle language"
              >
                <Globe size={15} className="action-icon" />
                <span className="lang-text">{lang === 'en' ? 'عربي' : 'EN'}</span>
              </button>

              {/* Light/Dark Mode Switcher */}
              <button
                className="nav-action-icon-btn"
                onClick={toggleTheme}
                title={
                  theme === 'dark'
                    ? lang === 'ar'
                      ? 'الوضع الفاتح (Light Mode)'
                      : 'Switch to Light Mode'
                    : lang === 'ar'
                    ? 'الوضع الداكن (Dark Mode)'
                    : 'Switch to Dark Mode'
                }
                aria-label="Toggle theme mode"
              >
                {theme === 'dark' ? (
                  <Sun size={17} className="theme-icon sun-icon" />
                ) : (
                  <Moon size={17} className="theme-icon moon-icon" />
                )}
              </button>

              {/* Settings / Admin Button */}
              <Link
                to="/admin/login"
                className="nav-settings-btn"
                title={lang === 'ar' ? 'الإعدادات / لوحة التحكم' : 'Settings / Admin'}
                aria-label="Settings"
              >
                <Settings size={16} className="settings-gear-icon" />
                <span className="settings-btn-text">{lang === 'ar' ? 'الإعدادات' : 'Settings'}</span>
              </Link>

              {/* Hamburger Menu for Mobile */}
              <button
                className="nav-hamburger"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                <span
                  className="hamburger-line"
                  style={mobileOpen ? { transform: 'rotate(45deg) translateY(7px)' } : {}}
                />
                <span
                  className="hamburger-line"
                  style={mobileOpen ? { opacity: 0 } : {}}
                />
                <span
                  className="hamburger-line"
                  style={mobileOpen ? { transform: 'rotate(-45deg) translateY(-7px)' } : {}}
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.target === e.currentTarget && setMobileOpen(false)}
          >
            {/* Close Button on top */}
            <button
              className="mobile-nav-close-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="Close mobile menu"
            >
              <X size={24} />
            </button>
            {/* Quick Actions in Mobile Menu */}
            <div className="mobile-nav-controls">
              <button
                className="nav-action-pill-btn"
                onClick={toggleLang}
                aria-label="Toggle language"
              >
                <Globe size={15} />
                <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
              </button>

              <button
                className="nav-action-icon-btn"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              <Link
                to="/admin/login"
                className="nav-settings-btn"
                onClick={() => setMobileOpen(false)}
                aria-label="Settings"
              >
                <Settings size={16} className="settings-gear-icon" />
                <span>{lang === 'ar' ? 'الإعدادات' : 'Settings'}</span>
              </Link>
            </div>

            <ul className="mobile-nav-links">
              {links.map(({ label, href }, i) => (
                <motion.li
                  key={href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    className="mobile-nav-link"
                    onClick={() => scrollTo(href)}
                    style={{ background: 'none', border: 'none' }}
                  >
                    {label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
