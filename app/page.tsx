"use client"

import type React from "react"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Wand2, Loader2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ResultModal } from "@/components/result-modal"
import { Button3D } from "@/components/button-3d"

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
        setResultImage(null)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (PNG, JPG, JPEG, WebP)",
          variant: "destructive",
        })
      }
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setResultImage(null)
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
        const errorData = await response.text()
        throw new Error(`Failed to transform image: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.imageUrl) {
        throw new Error("No image URL received from server")
      }

      setResultImage(data.imageUrl)
      setShowModal(true)

      toast({
        title: "Transformation Complete",
        description: "Your image has been successfully transformed",
        duration: 2000,
      })
    } catch (error) {
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
  }

  const examplePrompts = [
    "Convert into a Simpson style character",
    "Transform into a watercolor painting",
    "Make it look like a cyberpunk artwork",
    "Convert to anime/manga style",
    "Transform into a vintage photograph",
    "Make it look like an oil painting",
  ]

  return (
    <>
      <div className="min-h-screen bg-#fafafa p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-#1a1a1a">
              AI Image Transformer
            </h1>
            <p className="text-#666666 text-lg">
              Upload an image and describe how you want it transformed
            </p>
          </div>

          {/* Main Container */}
          <Card className="border border-#e5e5e5 shadow-sm">
            <CardContent className="p-8 space-y-8">
              
              {/* Upload or Image Display Section */}
              <div className="space-y-4">
                
                {!previewUrl ? (
                  // Upload Area - only show when no image
                  <>
                    <h2 className="text-xl font-semibold text-#333333">Upload Image</h2>
                    
                    <div className="border-2 border-dashed border-#d4d4d4 rounded-lg p-12 text-center hover:border-#ff6b35 hover:bg-#fff9f6 transition-all duration-200">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileSelect} 
                        className="hidden" 
                        id="file-upload" 
                      />
                      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-4">
                        <Upload className="w-16 h-16 text-#999999" />
                        <div className="space-y-2">
                          <p className="text-#333333 font-medium text-lg">Click to upload or drag and drop</p>
                          <p className="text-#999999">PNG, JPG, JPEG, WebP up to 10MB</p>
                        </div>
                      </label>
                    </div>
                  </>
                ) : (
                  // Image Preview - replaces upload area when image is selected
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-#333333">Selected Image</h2>
                      <button
                        onClick={handleRemoveImage}
                        className="p-2 text-#999999 hover:text-#ff6b35 hover:bg-#fff9f6 rounded-full transition-all duration-200"
                        title="Remove image and upload another"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-lg border border-#e5e5e5 bg-white">
                      <img
                        src={previewUrl}
                        alt="Selected image"
                        className="w-full h-auto max-h-96 object-cover mx-auto"
                      />
                    </div>
                    
                    {selectedFile && (
                      <div className="text-sm text-#666666 text-center">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-#e5e5e5"></div>

              {/* Prompt Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-#333333">Transformation Prompt</h2>
                
                <Textarea
                  placeholder="Describe how you want to transform your image..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-24 resize-none border-#d4d4d4 focus:border-#ff6b35 focus:ring-#ff6b35 focus:ring-opacity-20 text-#333333 placeholder:text-#999999"
                />

                {/* Example Prompts as Gray Buttons */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-#666666">Example prompts:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {examplePrompts.map((example, index) => (
                      <Button3D
                        key={index}
                        onClick={() => setPrompt(example)}
                        variant="default"
                        size="default"
                        className="text-left justify-start text-sm"
                        style={{
                          background: 'linear-gradient(to bottom, #666666, #444444)'
                        }}
                      >
                        "{example}"
                      </Button3D>
                    ))}
                  </div>
                </div>

                {/* Transform Button */}
                <Button3D
                  onClick={handleTransform}
                  disabled={!selectedFile || !prompt.trim() || isLoading}
                  variant="default"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full text-lg font-semibold py-4"
                  style={{
                    background: !selectedFile || !prompt.trim() || isLoading 
                      ? 'linear-gradient(to bottom, #cccccc, #aaaaaa)'
                      : 'linear-gradient(to bottom, #ff6b35, #e55a2e)'
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Transforming...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-3" />
                      Transform Image
                    </>
                  )}
                </Button3D>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card className="border border-#e5e5e5">
              <CardContent className="p-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 border-4 border-#e5e5e5 border-t-#ff6b35 rounded-full animate-spin"></div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-#333333">
                      Processing your image...
                    </p>
                    <p className="text-#666666 text-sm mt-1">
                      This usually takes 15-30 seconds
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Results Modal */}
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