import HeroSection from '../components/sections/HeroSection.jsx'
import AboutSection from '../components/sections/AboutSection.jsx'
import SkillsSection from '../components/sections/SkillsSection.jsx'
import ProjectsSection from '../components/sections/ProjectsSection.jsx'
import ServicesSection from '../components/sections/ServicesSection.jsx'
import ExperienceSection from '../components/sections/ExperienceSection.jsx'
import ContactSection from '../components/sections/ContactSection.jsx'
import ScrollReveal from '../components/layout/ScrollReveal.jsx'
import { useSiteSettings } from '../context/SiteSettingsContext.jsx'

export default function Home() {
  const { visibility } = useSiteSettings()

  return (
    <>
      {/* Hero — no scroll reveal, first thing visible */}
      {visibility?.hero !== false && <HeroSection />}

      {/* About */}
      {visibility?.about !== false && (
        <ScrollReveal direction="up" duration={0.8} threshold={0.12}>
          <AboutSection />
        </ScrollReveal>
      )}

      {/* Skills */}
      {visibility?.skills !== false && (
        <ScrollReveal direction="up" delay={0.05} duration={0.8} threshold={0.1}>
          <SkillsSection />
        </ScrollReveal>
      )}

      {/* Projects */}
      {visibility?.projects !== false && (
        <ScrollReveal direction="up" duration={0.8} threshold={0.08}>
          <ProjectsSection />
        </ScrollReveal>
      )}

      {/* Services */}
      {visibility?.services !== false && (
        <ScrollReveal direction="up" delay={0.05} duration={0.8} threshold={0.1}>
          <ServicesSection />
        </ScrollReveal>
      )}

      {/* Experience */}
      {visibility?.experience !== false && (
        <ScrollReveal direction="left" duration={0.8} threshold={0.1}>
          <ExperienceSection />
        </ScrollReveal>
      )}

      {/* Contact */}
      {visibility?.contact !== false && (
        <ScrollReveal direction="up" duration={0.8} threshold={0.08}>
          <ContactSection />
        </ScrollReveal>
      )}
    </>
  )
}
