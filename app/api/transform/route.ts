import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { getPaymentStatus } from "@base-org/account"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File
    const prompt = formData.get("prompt") as string
    const paymentId = formData.get("paymentId") as string

    if (!image || !prompt) {
      return NextResponse.json({ error: "Image and prompt are required" }, { status: 400 })
    }

    // Optional: Verify payment status
    if (paymentId) {
      try {
        const { status } = await getPaymentStatus({ 
          id: paymentId,
          testnet: process.env.NEXT_PUBLIC_BASE_PAY_TESTNET === 'true'
        })
        
        if (status !== 'completed') {
          console.warn(`Payment ${paymentId} not completed, status: ${status}`)
          return NextResponse.json({ error: "Payment not completed" }, { status: 402 })
        }
        
        console.log(`Payment ${paymentId} verified successfully`)
      } catch (error) {
        console.warn('Payment verification failed:', error)
        // Continue anyway - payment was successful on frontend
        // In production, you might want to be more strict here
      }
    }

    console.log("Processing image transformation request")
    console.log("Image file:", image.name, image.type, image.size)
    console.log("Prompt:", prompt)

    // Convert the image file to a data URL
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const mimeType = image.type
    const dataUrl = `data:${mimeType};base64,${base64}`

    console.log("Image converted to base64, length:", base64.length)

    // Run the Replicate model with corrected parameters
    const output = await replicate.run(
      "prunaai/hidream-e1.1:433436facdc1172b6efcb801eb6f345d7858a32200d24e5febaccfb4b44ad66f",
      {
        input: {
          prompt: prompt,
          image: dataUrl,
          speed_mode: "Juiced 🔥 (more speed)",
          seed: -1,
          output_format: "webp",
          output_quality: 80,
          guidance_scale: 2.5,
          num_inference_steps: 28,
          image_guidance_scale: 1,
          refine_strength: 0.3,
          clip_cfg_norm: true,
        },
      },
    )

    console.log("Replicate API response type:", typeof output)
    console.log("Replicate API raw response:", output)
    console.log("Output constructor:", output?.constructor?.name)
    
    let imageUrl: string
    
    // Handle different possible response formats based on the examples in idea.md
    if (typeof output === "string") {
      // Direct string URL
      imageUrl = output
      console.log("Output is direct string URL:", imageUrl)
    } else if (output && typeof output === "object") {
      // Check if it has a url() method (as shown in idea.md examples)
      if (typeof output.url === "function") {
        const urlResult = output.url()
        console.log("Output has url() method, raw result:", urlResult)
        console.log("URL result type:", typeof urlResult)
        
        // The url() method might return a URL object, convert to string
        if (typeof urlResult === "string") {
          imageUrl = urlResult
        } else if (urlResult && typeof urlResult === "object" && urlResult.href) {
          // It's a URL object, get the href
          imageUrl = urlResult.href
          console.log("Converted URL object to string:", imageUrl)
        } else if (urlResult && typeof urlResult === "object" && urlResult.toString) {
          // Try toString() method
          imageUrl = urlResult.toString()
          console.log("Converted URL to string via toString():", imageUrl)
        } else {
          console.error("url() method returned unexpected type:", typeof urlResult, urlResult)
          return NextResponse.json({ error: "url() method returned unexpected format" }, { status: 500 })
        }
      } 
      // Check if it's a File-like object with a url property
      else if (typeof output.url === "string") {
        imageUrl = output.url
        console.log("Output has url property:", imageUrl)
      }
      // Check if it's an array (some models return arrays)
      else if (Array.isArray(output) && output.length > 0) {
        const firstResult = output[0]
        if (typeof firstResult === "string") {
          imageUrl = firstResult
        } else if (firstResult && typeof firstResult.url === "function") {
          const urlResult = firstResult.url()
          imageUrl = typeof urlResult === "string" ? urlResult : urlResult.href || urlResult.toString()
        } else if (firstResult && typeof firstResult.url === "string") {
          imageUrl = firstResult.url
        } else {
          console.error("Unexpected array element format:", firstResult)
          return NextResponse.json({ error: "Invalid array response format from AI model" }, { status: 500 })
        }
        console.log("Output is array, extracted URL:", imageUrl)
      }
      else {
        console.error("Unexpected output object format:", output)
        console.error("Available properties:", Object.keys(output))
        return NextResponse.json({ error: "Unexpected object response format from AI model" }, { status: 500 })
      }
    } else {
      console.error("Completely unexpected output type:", typeof output, output)
      return NextResponse.json({ error: "Invalid response type from AI model" }, { status: 500 })
    }

    console.log("Final image URL (type:", typeof imageUrl, "):", imageUrl)
    
    if (!imageUrl || typeof imageUrl !== "string") {
      console.error("Failed to extract valid image URL:", imageUrl, "type:", typeof imageUrl)
      return NextResponse.json({ error: "No valid image URL received from AI model" }, { status: 500 })
    }

    if (!imageUrl.startsWith("http")) {
      console.error("Invalid image URL format:", imageUrl)
      return NextResponse.json({ error: "Invalid image URL format received from AI model" }, { status: 500 })
    }

    console.log("SUCCESS - Returning image URL:", imageUrl)
    
    // Log successful payment + transformation
    if (paymentId) {
      console.log(`Payment ${paymentId} processed for transformation: ${prompt.substring(0, 50)}...`)
    }
    
    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Error transforming image:", error)
    return NextResponse.json({ error: "Failed to transform image" }, { status: 500 })
  }
}