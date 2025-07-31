"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button3D } from "@/components/button-3d"

interface ResultModalProps {
  isOpen: boolean
  onClose: () => void
  originalImage: string | null
  transformedImage: string | null
  prompt: string
}

export function ResultModal({ 
  isOpen, 
  onClose, 
  originalImage, 
  transformedImage, 
  prompt 
}: ResultModalProps) {
  const { toast } = useToast()

  const handleDownload = async () => {
    if (!transformedImage) return

    try {
      const response = await fetch(transformedImage)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ai-transformed-${Date.now()}.webp`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Downloaded successfully",
        description: "Your transformed image has been saved",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!transformedImage) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 border border-#e5e5e5 bg-#fafafa">
        
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-#e5e5e5 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-#1a1a1a">
                Transformation Complete
              </DialogTitle>
              <p className="text-#666666 mt-1">
                "{prompt}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-#999999 hover:text-#333333 hover:bg-#f5f5f5 rounded-full transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Content - Focus on Results */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Original Image - Smaller */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-#666666">
              <div className="w-3 h-3 bg-#d4d4d4 rounded-full"></div>
              Original
            </div>
            <div className="relative overflow-hidden rounded-lg border border-#e5e5e5 shadow-sm bg-white">
              {originalImage && (
                <img
                  src={originalImage}
                  alt="Original"
                  className="w-full h-auto max-h-64 object-cover"
                />
              )}
            </div>
          </div>

          {/* Transformed Image - Main Focus */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-#666666">
              <div className="w-3 h-3 bg-#ff6b35 rounded-full"></div>
              Transformed
            </div>
            <div className="relative overflow-hidden rounded-lg border border-#ff6b35 shadow-lg bg-white">
              <img
                src={transformedImage}
                alt="Transformed result"
                className="w-full h-auto max-h-96 object-cover"
              />
              
              {/* Success indicator */}
              <div className="absolute top-3 right-3 bg-#ff6b35 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                New
              </div>
            </div>
          </div>

          {/* Action Buttons using Button3D */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button3D
              onClick={handleDownload}
              variant="default"
              size="lg"
              className="flex items-center justify-center gap-3 text-lg font-semibold px-8 py-4"
              style={{
                background: 'linear-gradient(to bottom, #ff6b35, #e55a2e)'
              }}
            >
              <Download className="w-5 h-5" />
              Download Image
            </Button3D>
            
            <Button3D
              onClick={onClose}
              variant="default"
              size="lg"
              className="flex items-center justify-center text-lg font-semibold px-8 py-4"
              style={{
                background: 'linear-gradient(to bottom, #666666, #444444)'
              }}
            >
              Create Another
            </Button3D>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}