"use client"

import type React from "react"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Loader2, X, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button3D } from "@/components/button-3d"
import { PaymentModal } from "@/components/payment-modal"

export default function ImageTransformer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file)
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
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
  }

  const handleStartPayment = () => {
    if (!selectedFile || !prompt.trim()) {
      toast({
        title: "Missing requirements",
        description: "Please select an image and enter a prompt first",
        variant: "destructive",
      })
      return
    }
    setShowPaymentModal(true)
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
              Base Pay Demo
            </h1>
            <p className="text-#666666 text-lg">
              Upload an image and describe how you want it transformed
            </p>
            {/* Pricing Display */}
            <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-#fff9f6 border border-#ff6b35 rounded-lg">
              <DollarSign className="w-5 h-5 text-#ff6b35" />
              <span className="text-lg font-semibold text-#ff6b35">$0.20 per image</span>
            </div>
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
                        className="w-full h-auto max-h-96 object-contain mx-auto"
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
                  onClick={handleStartPayment}
                  variant="default"
                  size="lg"
                  className="w-full flex items-center justify-center gap-3 text-lg font-semibold py-4"
                  style={{
                    background: 'linear-gradient(to bottom, #ff6b35, #e55a2e)'
                  }}
                >
                  <DollarSign className="w-5 h-5" />
                  Create Image ($0.20)
                </Button3D>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedFile={selectedFile}
        prompt={prompt}
        originalImage={previewUrl}
      />
    </>
  )
}