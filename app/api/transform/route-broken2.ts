import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File
    const prompt = formData.get("prompt") as string

    if (!image || !prompt) {
      return NextResponse.json({ error: "Image and prompt are required" }, { status: 400 })
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
        imageUrl = output.url()
        console.log("Output has url() method, result:", imageUrl)
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
          imageUrl = firstResult.url()
        } else if (firstResult && typeof firstResult.url === "string") {
          imageUrl = firstResult.url
        } else {
          console.error("Unexpected array element format:", firstResult)
          return NextResponse.json({ error: "Invalid array response format from AI model" }, { status: 500 })
        }
        console.log("Output is array, extracted URL:", imageUrl)
      }
      // If it's a ReadableStream or File-like object, try to convert it
      else if (output.constructor?.name === "ReadableStream" || output instanceof ReadableStream) {
        console.log("Output is ReadableStream, this suggests a File object")
        // For File objects from Replicate, we need to get the URL
        // This might be a File object that needs to be handled differently
        if (typeof output.url === "function") {
          imageUrl = output.url()
        } else {
          console.error("ReadableStream without url() method:", output)
          return NextResponse.json({ error: "Cannot extract URL from ReadableStream response" }, { status: 500 })
        }
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

    console.log("Final image URL:", imageUrl)
    
    if (!imageUrl || typeof imageUrl !== "string") {
      console.error("Failed to extract valid image URL:", imageUrl)
      return NextResponse.json({ error: "No valid image URL received from AI model" }, { status: 500 })
    }

    if (!imageUrl.startsWith("http")) {
      console.error("Invalid image URL format:", imageUrl)
      return NextResponse.json({ error: "Invalid image URL format received from AI model" }, { status: 500 })
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Error transforming image:", error)
    return NextResponse.json({ error: "Failed to transform image" }, { status: 500 })
  }
}