import { useState, useEffect } from "react"
import { Card } from "../shared/ui"
import { Check } from "lucide-react"

const LOADING_STEPS = [
  "Scanning shelf inventory",
  "Analyzing location signals",
  "Calculating cash flow estimate",
  "Running fraud detection",
  "Generating risk assessment",
]

export function AnalysisLoader() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % LOADING_STEPS.length)
    }, 2200)

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 6, 92))
    }, 350)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <Card className="mx-auto max-w-xl p-12">
      <div className="flex flex-col items-center text-center">
        {/* Spinner */}
        <div className="relative mb-8 h-24 w-24">
          {/* Outer ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent" style={{ animationDuration: "1.4s" }} />
          {/* Middle ring */}
          <div className="absolute inset-3 animate-spin rounded-full border-2 border-transparent border-t-success" style={{ animationDuration: "1s", animationDirection: "reverse" }} />
          {/* Inner ring */}
          <div className="absolute inset-6 animate-spin rounded-full border-2 border-transparent border-t-warning" style={{ animationDuration: "0.7s" }} />
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-card" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 w-full">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-muted-foreground">Processing</span>
            <span className="font-mono text-accent">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-success transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="w-full space-y-3">
          {LOADING_STEPS.map((step, index) => (
            <div
              key={step}
              className="flex items-center gap-3"
              style={{ opacity: index <= currentStep ? 1 : 0.3 }}
            >
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                {index < currentStep ? (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-success">
                    <Check className="h-3 w-3 text-success-foreground" />
                  </div>
                ) : index === currentStep ? (
                  <div className="h-2 w-2 rounded-full bg-accent pulse-dot" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-border" />
                )}
              </div>
              <span className="text-left text-sm text-muted-foreground">
                {step}
              </span>
              {index < currentStep && (
                <span className="ml-auto text-xs text-success">Done</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
