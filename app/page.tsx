import Navbar from '@/components/nav/Navbar'
import HeroSection from '@/components/hero/HeroSection'
import ScanSection from '@/components/scan/ScanSection'
import HowItWorks from '@/components/sections/HowItWorks'
import IdentityGraph from '@/components/graph/IdentityGraph'
import UseCaseTabs from '@/components/sections/UseCaseTabs'
import Footer from '@/components/sections/Footer'
import ScrollObserver from '@/components/ui/ScrollObserver'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ScanSection />
        <HowItWorks />
        <IdentityGraph />
        <UseCaseTabs />
      </main>
      <Footer />
      <ScrollObserver />
    </>
  )
}
