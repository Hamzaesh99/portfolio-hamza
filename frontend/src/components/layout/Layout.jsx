import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

export default function Layout() {
  return (
    <>
      {/* Background effects */}
      <div className="grid-bg" />
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
      <Footer />

      {/* Scroll to top */}
      <ScrollTopButton />
    </>
  )
}

function ScrollTopButton() {
  const handleClick = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  return (
    <button className="scroll-top" onClick={handleClick} aria-label="Scroll to top">
      ↑
    </button>
  )
}
