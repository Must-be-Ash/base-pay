"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Wand2, Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ImageTransformer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file)
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        setResultImage(null) // Clear previous result
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (PNG, JPG, JPEG, WebP)",
          variant: "destructive",
        })
      }
    }
  }

  const handleTransform = async () => {
    if (!selectedFile || !prompt.trim()) {
      toast({
        title: "Missing requirements",
        description: "Please select an image and enter a transformation prompt",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("image", selectedFile)
      formData.append("prompt", prompt)

      const response = await fetch("/api/transform", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to transform image")
      }

      const data = await response.json()
      setResultImage(data.imageUrl)

      toast({
        title: "Success!",
        description: "Your image has been transformed successfully",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to transform image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!resultImage) return

    try {
      const response = await fetch(resultImage)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "transformed-image.webp"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">AI Image Transformer</h1>
          <p className="text-gray-600 text-sm md:text-base">Upload an image and describe how you want it transformed</p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                <span className="text-xs text-gray-400">PNG, JPG, JPEG, WebP up to 10MB</span>
              </label>
            </div>

            {previewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="max-w-full h-auto max-h-64 mx-auto rounded-lg shadow-md"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prompt Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Transformation Prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe how you want to transform your image (e.g., 'Convert the image into a Simpson style character', 'Make it look like a watercolor painting', 'Transform into cyberpunk style')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-20 resize-none"
            />

            <Button
              onClick={handleTransform}
              disabled={!selectedFile || !prompt.trim() || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transforming...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Create Transformation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result Section */}
        {resultImage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Transformed Image</span>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <img
                  src={resultImage || "/placeholder.svg"}
                  alt="Transformed result"
                  className="w-full h-auto rounded-lg shadow-lg"
                />

                {/* Comparison View on larger screens */}
                {previewUrl && (
                  <div className="hidden md:grid md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Original</h3>
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Original"
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Transformed</h3>
                      <img
                        src={resultImage || "/placeholder.svg"}
                        alt="Transformed"
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Example Prompts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Example Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Convert the image into a Simpson style character",
                "Transform into a watercolor painting",
                "Make it look like a cyberpunk artwork",
                "Convert to anime/manga style",
                "Transform into a vintage photograph",
                "Make it look like a oil painting",
              ].map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(example)}
                  className="text-left justify-start h-auto p-3 text-xs"
                >
                  {example}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
