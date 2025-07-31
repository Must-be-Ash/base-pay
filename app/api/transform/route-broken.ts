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
          speed_mode: "Juiced 🔥 (more speed)", // Updated to match schema
          seed: -1,
          output_format: "webp",
          output_quality: 80,
          guidance_scale: 2.5, // Updated to match schema default
          num_inference_steps: 28,
          image_guidance_scale: 1, // Updated to match schema default
          refine_strength: 0.3,
          clip_cfg_norm: true,
        },
      },
    )

    console.log("Replicate API response type:", typeof output)
    console.log("Replicate API response:", output)
    
    // According to the schema, output is a string (URI)
    if (typeof output !== "string") {
      console.error("Unexpected output type from Replicate API:", typeof output, output)
      return NextResponse.json({ error: "Invalid response format from AI model" }, { status: 500 })
    }

    const imageUrl = output
    console.log("Final image URL:", imageUrl)
    
    if (!imageUrl || !imageUrl.startsWith("http")) {
      console.error("Invalid image URL received:", imageUrl)
      return NextResponse.json({ error: "Invalid image URL received from AI model" }, { status: 500 })
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Error transforming image:", error)
    return NextResponse.json({ error: "Failed to transform image" }, { status: 500 })
  }
}