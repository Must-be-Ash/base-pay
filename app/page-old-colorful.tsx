"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Wand2, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ResultModal } from "@/components/result-modal"

export default function ImageTransformer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file)
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        setResultImage(null) // Clear previous result
        console.log("File selected:", file.name, file.type, file.size)
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
    console.log("Starting image transformation...")

    try {
      const formData = new FormData()
      formData.append("image", selectedFile)
      formData.append("prompt", prompt)

      console.log("Sending request to /api/transform")
      const response = await fetch("/api/transform", {
        method: "POST",
        body: formData,
      })

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("API error response:", errorData)
        throw new Error(`Failed to transform image: ${response.status}`)
      }

      const data = await response.json()
      console.log("API response data:", data)
      console.log("Image URL from API:", data.imageUrl)
      
      if (!data.imageUrl) {
        console.error("No imageUrl in response:", data)
        throw new Error("No image URL received from server")
      }

      setResultImage(data.imageUrl)
      console.log("Result image state set to:", data.imageUrl)

      // Show the exciting modal instead of inline results
      setShowModal(true)

      toast({
        title: "✨ Magic Complete!",
        description: "Your image has been transformed successfully!",
        duration: 2000,
      })
    } catch (error) {
      console.error("Error during transformation:", error)
      toast({
        title: "Transformation Failed",
        description: `${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    // Optionally clear the form for another transformation
    // setSelectedFile(null)
    // setPreviewUrl(null)
    // setPrompt("")
  }

  console.log("Current state - resultImage:", resultImage, "isLoading:", isLoading)

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Image Transformer
              </h1>
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600 text-sm md:text-base">Upload an image and describe how you want it transformed</p>
          </div>

          {/* Upload Section */}
          <Card className="border-2 border-dashed border-purple-200 hover:border-purple-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Upload className="w-5 h-5" />
                Upload Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-colors">
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                  <Upload className="w-8 h-8 text-purple-400" />
                  <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                  <span className="text-xs text-gray-400">PNG, JPG, JPEG, WebP up to 10MB</span>
                </label>
              </div>

              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full h-auto max-h-64 mx-auto"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prompt Section */}
          <Card className="border-purple-200 hover:border-purple-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Wand2 className="w-5 h-5" />
                Transformation Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe how you want to transform your image (e.g., 'Convert the image into a Simpson style character', 'Make it look like a watercolor painting', 'Transform into cyberpunk style')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-20 resize-none border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />

              <Button
                onClick={handleTransform}
                disabled={!selectedFile || !prompt.trim() || isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span className="animate-pulse">Creating Magic...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    <Sparkles className="w-4 h-4 mr-1" />
                    Create Transformation
                    <Sparkles className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="p-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-purple-700 animate-pulse">
                      AI is working its magic... ✨
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      This usually takes 15-30 seconds
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Example Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Example Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Convert the image into a Simpson style character",
                  "Transform into a watercolor painting",
                  "Make it look like a cyberpunk artwork",
                  "Convert to anime/manga style",
                  "Transform into a vintage photograph",
                  "Make it look like an oil painting",
                ].map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setPrompt(example)}
                    className="text-left justify-start h-auto p-3 text-xs border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Debug Info - only in development */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm">Debug Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1 text-gray-500">
                  <p>Selected file: {selectedFile?.name || 'None'}</p>
                  <p>Prompt: {prompt || 'None'}</p>
                  <p>Is loading: {isLoading ? 'Yes' : 'No'}</p>
                  <p>Result image URL: {resultImage ? 'Available' : 'None'}</p>
                  <p>Modal open: {showModal ? 'Yes' : 'No'}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Exciting Results Modal */}
      <ResultModal
        isOpen={showModal}
        onClose={handleModalClose}
        originalImage={previewUrl}
        transformedImage={resultImage}
        prompt={prompt}
      />
    </>
  )
}