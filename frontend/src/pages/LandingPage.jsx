import { Navbar, Hero, ProcessFlow, Features, Metrics, Footer } from "../components/landing"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <ProcessFlow />
        <Features />
        <Metrics />
      </main>
      <Footer />
    </div>
  )
}
