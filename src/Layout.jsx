import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function Layout({ title, children }) {
  useEffect(() => {
    document.title = title ? `${title} • Nayay Sutra` : 'Nayay Sutra'
  }, [title])

  return (
    <>
      <Navbar />
      <main className="flex-grow w-full">{children}</main>
      <Footer />
    </>
  )
}