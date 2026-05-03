import { useState, useRef } from "react"
import { Upload, X, MapPin, Loader2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Label } from "../shared/ui"
import { cn } from "../../lib/utils"

export function UploadForm({ onSubmit, isLoading }) {
  const [images, setImages] = useState([])
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [locError, setLocError] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [locLoading, setLocLoading] = useState(false)
  const fileRef = useRef()

  const addFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"))
    setImages((prev) => [...prev, ...valid].slice(0, 5))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const useLocation = () => {
    setLocLoading(true)
    setLocError("")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6))
        setLng(pos.coords.longitude.toFixed(6))
        setLocLoading(false)
      },
      () => {
        setLocError("Location access denied. Please enter coordinates manually.")
        setLocLoading(false)
      }
    )
  }

  const canSubmit = images.length >= 1 && lat && lng && !isLoading

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(images, parseFloat(lat), parseFloat(lng))
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Image Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-accent/10 font-mono text-xs font-medium text-accent">
              01
            </span>
            Store Images
          </CardTitle>
          <CardDescription>
            Upload 3-5 clear photographs of the store interior showing shelves, counter, and entrance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
              isDragging
                ? "border-accent bg-accent/5"
                : "border-border hover:border-accent/50 hover:bg-card/50"
            )}
          >
            <Upload className={cn("mb-3 h-8 w-8", isDragging ? "text-accent" : "text-muted-foreground")} />
            <p className="mb-1 text-sm font-medium text-foreground">
              Drag & drop, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              {images.length}/5 selected | JPG, PNG, WEBP
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border"
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Store image ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setImages((prev) => prev.filter((_, idx) => idx !== i))
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 px-1.5 py-0.5">
                    <span className="font-mono text-[10px] text-white">
                      {(img.size / 1024).toFixed(0)}KB
                    </span>
                  </div>
                </div>
              ))}
              {images.length < 5 && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-border text-2xl text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
                >
                  +
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* GPS Coordinates Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-accent/10 font-mono text-xs font-medium text-accent">
              02
            </span>
            GPS Coordinates
          </CardTitle>
          <CardDescription>
            Provide store location for geo-intelligence analysis and competition mapping.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                placeholder="21.145800"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                placeholder="79.088200"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={useLocation}
            disabled={locLoading}
            className="w-full gap-2"
          >
            {locLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {locLoading ? "Detecting location..." : "Use Current Location"}
          </Button>

          {locError && (
            <p className="text-sm text-danger">{locError}</p>
          )}

          {/* Submit */}
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Start Analysis"
              )}
            </Button>
            {!canSubmit && !isLoading && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {images.length === 0
                  ? "Add at least 1 store image to continue"
                  : "Enter GPS coordinates to continue"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
