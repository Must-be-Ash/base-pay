"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, X, Sparkles, Zap, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
        title: "Downloaded! 🎉",
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 border-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
        {/* Header */}
        <DialogHeader className="relative p-6 pb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  ✨ Transformation Complete!
                </DialogTitle>
                <p className="text-purple-100 mt-1">
                  "{prompt}"
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Animated sparkles */}
          <div className="absolute top-4 right-20 animate-pulse">
            <Zap className="w-4 h-4 text-yellow-300" />
          </div>
          <div className="absolute top-8 right-32 animate-bounce delay-300">
            <Sparkles className="w-3 h-3 text-pink-300" />
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Before/After Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Original Image */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                Original
              </div>
              <div className="relative group overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                {originalImage && (
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-auto max-h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg animate-pulse">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  AI Magic ✨
                </span>
              </div>
            </div>

            {/* Mobile Arrow */}
            <div className="md:hidden flex justify-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                  <ArrowRight className="w-4 h-4 text-white rotate-90" />
                </div>
                <span className="text-xs font-medium text-gray-500">AI Magic ✨</span>
              </div>
            </div>

            {/* Transformed Image */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                Transformed
              </div>
              <div className="relative group overflow-hidden rounded-xl border-2 border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-2xl transition-all duration-300">
                <img
                  src={transformedImage}
                  alt="Transformed result"
                  className="w-full h-auto max-h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                  onLoad={() => {
                    // Add a subtle success animation
                    console.log("Transformed image loaded successfully!")
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Success badge */}
                <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                  <Sparkles className="w-3 h-3" />
                  New!
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleDownload}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Image
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
              className="border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900/20 transition-all duration-300"
            >
              Create Another
            </Button>
          </div>

          {/* Fun stats */}
          <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-purple-100 dark:border-purple-800">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">✨</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">AI Powered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">🎨</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Artistic</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">⚡</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Fast</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}