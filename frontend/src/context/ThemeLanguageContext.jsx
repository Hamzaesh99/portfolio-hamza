import { createContext, useContext, useState, useEffect } from 'react'

const ThemeLanguageContext = createContext(null)

export function ThemeLanguageProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })

  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'en'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang)
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
    localStorage.setItem('lang', lang)
  }, [lang])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'))
  }

  return (
    <ThemeLanguageContext.Provider value={{ theme, lang, toggleTheme, toggleLang }}>
      {children}
    </ThemeLanguageContext.Provider>
  )
}

export function useThemeLanguage() {
  const context = useContext(ThemeLanguageContext)
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider')
  }
  return context
}
