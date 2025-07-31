"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button3D } from "@/components/button-3d"
import { BasePayButton } from "@base-org/account-ui/react"
import { pay } from "@base-org/account"


interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedFile: File | null
  prompt: string
  originalImage: string | null
}

type PaymentStatus = 'idle' | 'paying' | 'paid' | 'processing' | 'error' | 'complete'

export function PaymentModal({ 
  isOpen, 
  onClose, 
  selectedFile, 
  prompt, 
  originalImage 
}: PaymentModalProps) {
  const { toast } = useToast()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile-aware toast helper
  const showToast = (options: Parameters<typeof toast>[0]) => {
    if (!isMobile) {
      toast(options)
    } else {
      console.log(`Mobile toast suppressed: ${options.title} - ${options.description}`)
    }
  }

  const handlePayment = async () => {
    if (!selectedFile || !prompt.trim()) {
      showToast({
        title: "Missing requirements",
        description: "Please select an image and enter a prompt first",
        variant: "destructive",
      })
      return
    }
    
    setPaymentStatus('paying')
    setPaymentError(null)
    
    try {
      const result = await pay({
        amount: '0.20',
        to: '0xAbF01df9428EaD5418473A7c91244826A3Af23b3',
        testnet: process.env.NEXT_PUBLIC_BASE_PAY_TESTNET === 'true'
      })
      
      // Handle different result types and ensure we have a valid payment ID
      let paymentId: string
      if (typeof result === 'string') {
        paymentId = result
      } else if (result && typeof result === 'object' && 'id' in result) {
        paymentId = String(result.id)
      } else {
        throw new Error('Invalid payment result received')
      }
      
      // Validate that paymentId is a non-empty string
      if (!paymentId || typeof paymentId !== 'string' || paymentId.trim() === '') {
        throw new Error('Payment was cancelled or failed')
      }
      
      setPaymentId(paymentId)
      setPaymentStatus('paid')
      
      showToast({
        title: "Payment Successful",
        description: "Starting image transformation...",
        duration: 2000,
      })
      
      // Start image transformation after successful payment
      await handleTransformAfterPayment(paymentId)
    } catch (error) {
      setPaymentStatus('error')
      setPaymentId(null)
      setPaymentError(error instanceof Error ? error.message : 'Payment failed')
      showToast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'Payment failed. Please try again.',
        variant: "destructive",
      })
      console.error('Payment failed:', error)
    }
  }

  const handleTransformAfterPayment = async (paymentId: string) => {
    setPaymentStatus('processing')

    try {
      const formData = new FormData()
      formData.append("image", selectedFile!)
      formData.append("prompt", prompt)
      formData.append("paymentId", paymentId)

      const response = await fetch("/api/transform", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        await response.text()
        throw new Error(`Failed to transform image: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.imageUrl) {
        throw new Error("No image URL received from server")
      }

      setResultImage(data.imageUrl)
      setPaymentStatus('complete')

      showToast({
        title: "Transformation Complete",
        description: "Your image has been successfully transformed",
        duration: 2000,
      })
    } catch (error) {
      setPaymentStatus('error')
      setPaymentError('Transformation failed after payment. Please contact support with payment ID: ' + paymentId)
      showToast({
        title: "Transformation Failed",
        description: `Payment successful but transformation failed. Payment ID: ${paymentId}`,
        variant: "destructive",
      })
      console.error('Paid transformation failed:', { paymentId, error })
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
      a.download = `ai-transformed-${Date.now()}.webp`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showToast({
        title: "Downloaded successfully",
        description: "Your transformed image has been saved",
      })
    } catch (error) {
      showToast({
        title: "Download failed",
        description: "Could not download the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    // Reset state when closing
    setPaymentStatus('idle')
    setPaymentError(null)
    setPaymentId(null)
    setResultImage(null)
    onClose()
  }

  const handleCreateAnother = () => {
    // Reset state for new transformation
    setPaymentStatus('idle')
    setPaymentError(null)
    setPaymentId(null)
    setResultImage(null)
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent 
          className="max-w-2xl w-[calc(100vw-2rem)] max-h-[95vh] overflow-y-auto p-0 border border-#e5e5e5 bg-white"
          showCloseButton={false} 
          style={{ 
            backgroundColor: 'white',
            background: 'white',
            maxHeight: isMobile ? 'calc(100vh - 1rem)' : '95vh',
            margin: isMobile ? '0.5rem 0' : '0'
          }}
        >
        
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-#e5e5e5 bg-white relative" style={{ backgroundColor: 'white' }}>
          <div className="flex items-center justify-center w-full">
            <div className="text-center max-w-[calc(100%-4rem)]">
              <DialogTitle className="text-2xl font-bold text-#1a1a1a">
                {paymentStatus === 'complete' ? 'Transformation Complete' : 'Pay & Transform'}
              </DialogTitle>
              <p className="text-#666666 mt-1">
                {paymentStatus === 'complete' ? `"${prompt}"` : 'Pay-per-use AI image transformation'}
              </p>
            </div>
          </div>
          {/* Single Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-#999999 hover:text-#333333 hover:bg-#f5f5f5 rounded-full transition-all duration-200 z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        {/* Content */}
        <div 
          className="p-6" 
          style={{ 
            backgroundColor: 'white',
            paddingBottom: isMobile ? '4rem' : '1.5rem'
          }}
        >
          
          {/* Payment Flow */}
          {paymentStatus === 'idle' && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-#ff6b35 to-#e55a2e rounded-full flex items-center justify-center">
                  <span className="text-black text-2xl font-bold">$</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-#333333">Pay-Per-Use Service</h3>
                  <p className="text-#666666 mt-2">
                    Transform your image with AI for just $0.20 per transformation
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">What you'll get:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• High-quality AI image transformation</li>
                  <li>• Instant processing (15-30 seconds)</li>
                  <li>• Downloadable result</li>
                  <li>• No subscription required</li>
                </ul>
              </div>

              <div className="text-center">
                <BasePayButton
                  colorScheme="light"
                  onClick={handlePayment}
                />
              </div>
            </div>
          )}

          {/* Payment Processing */}
          {paymentStatus === 'paying' && (
            <div className="text-center space-y-6 py-8">
              <div className="relative flex justify-center">
                <Loader2 className="w-16 h-16 text-#ff6b35 animate-spin" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-#333333 mb-2">Processing Payment...</h3>
                <p className="text-#666666">Please complete the payment in your wallet</p>
              </div>
            </div>
          )}

          {/* Image Processing */}
          {paymentStatus === 'processing' && (
            <div className="text-center space-y-6 py-8">
              <div className="relative flex justify-center">
                <Loader2 className="w-16 h-16 text-#ff6b35 animate-spin" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-#333333 mb-2">Payment confirmed! Processing your image...</h3>
                <p className="text-#666666 mb-4">This usually takes 15-30 seconds</p>
                {paymentId && typeof paymentId === 'string' && paymentId.length > 0 && (
                  <p className="text-#999999 text-xs">
                    Payment ID: {paymentId.substring(0, 8)}...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error State */}
          {paymentStatus === 'error' && (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h3>
                <p className="text-#666666 mb-4">{paymentError}</p>
                <Button3D
                  onClick={() => setPaymentStatus('idle')}
                  variant="default"
                  size="default"
                  className="mx-auto"
                  style={{
                    background: 'linear-gradient(to bottom, #ff6b35, #e55a2e)'
                  }}
                >
                  Try Again
                </Button3D>
              </div>
            </div>
          )}

          {/* Results Display */}
          {paymentStatus === 'complete' && resultImage && (
            <div className="space-y-6">
              {/* Transformed Image */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-#666666">
                  <div className="w-3 h-3 bg-#ff6b35 rounded-full"></div>
                  Your AI Generated Image
                </div>
                <div className="relative overflow-hidden rounded-lg border border-#ff6b35 shadow-lg bg-white p-4">
                  <img
                    src={resultImage}
                    alt="Transformed result"
                    className={`w-full h-auto ${isMobile ? 'object-contain max-h-[50vh]' : 'object-cover max-h-[40vh]'}`}
                  />
                  <div className="absolute top-7 right-7 bg-#ff6b35 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                    New
                  </div>
                </div>
              </div>

                              {/* Action Buttons */}
                <div className={`flex flex-col gap-3 pt-4 ${isMobile ? 'pb-4' : 'pb-2'}`}>
                  <Button3D
                    onClick={handleDownload}
                    variant="default"
                    size="lg"
                    className="w-full flex items-center justify-center gap-3 text-lg font-semibold px-8 py-4"
                    style={{
                      background: 'linear-gradient(to bottom, #ff6b35, #e55a2e)'
                    }}
                  >
           
                    Download Image
                  </Button3D>
                  
                  <Button3D
                    onClick={handleCreateAnother}
                    variant="default"
                    size="lg"
                    className="w-full flex items-center justify-center text-lg font-semibold px-8 py-4"
                    style={{
                      background: 'linear-gradient(to bottom, #666666, #444444)'
                    }}
                  >
                    Create Another
                  </Button3D>
                </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
} 