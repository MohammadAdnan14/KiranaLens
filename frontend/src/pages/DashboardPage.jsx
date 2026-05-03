import { useState } from "react"
import axios from "axios"
import { DashboardLayout, UploadForm, AnalysisLoader, StoreProfile } from "../components/dashboard"
import { Card, CardContent } from "../components/shared/ui"
import { AlertTriangle } from "lucide-react"

const API_URL = "http://127.0.0.1:8000"

export function DashboardPage() {
  const [screen, setScreen] = useState("upload") // upload | loading | results
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  const handleSubmit = async (images, lat, lng) => {
    setError("")
    setScreen("loading")

    try {
      const formData = new FormData()
      images.forEach((img) => formData.append("images", img))
      formData.append("lat", lat)
      formData.append("lng", lng)

      const res = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      })

      if (res.data.error) {
        throw new Error(res.data.error)
      }

      setResult({ ...res.data, lat, lng })
      setScreen("results")
    } catch (err) {
      setError(err.message || "Backend unreachable. Please ensure the server is running on port 8000.")
      setScreen("upload")
    }
  }

  const handleReset = () => {
    setResult(null)
    setScreen("upload")
  }

  const getBreadcrumbs = () => {
    switch (screen) {
      case "loading":
        return ["Dashboard", "New Analysis", "Processing"]
      case "results":
        return ["Dashboard", "Analysis Results"]
      default:
        return ["Dashboard", "New Analysis"]
    }
  }

  return (
    <DashboardLayout 
      title="Dashboard" 
      breadcrumbs={getBreadcrumbs()}
    >
      {/* Error Alert */}
      {error && (
        <Card className="mb-6 border-danger/30 bg-danger/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-danger" />
            <div>
              <p className="font-medium text-danger">Analysis Failed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Screen Content */}
      {screen === "upload" && (
        <UploadForm onSubmit={handleSubmit} isLoading={false} />
      )}

      {screen === "loading" && <AnalysisLoader />}

      {screen === "results" && result && (
        <StoreProfile data={result} onReset={handleReset} />
      )}
    </DashboardLayout>
  )
}
