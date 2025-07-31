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

    // Convert the image file to a data URL
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const mimeType = image.type
    const dataUrl = `data:${mimeType};base64,${base64}`

    // Run the Replicate model
    const output = (await replicate.run(
      "prunaai/hidream-e1.1:433436facdc1172b6efcb801eb6f345d7858a32200d24e5febaccfb4b44ad66f",
      {
        input: {
          seed: -1,
          image: dataUrl,
          prompt: prompt,
          speed_mode: "Extra Juiced 🚀 (even more speed)",
          clip_cfg_norm: true,
          output_format: "webp",
          guidance_scale: 3.5,
          output_quality: 80,
          refine_strength: 0.3,
          num_inference_steps: 28,
          image_guidance_scale: 2,
        },
      },
    )) as any

    // The output should be a URL to the generated image
    const imageUrl = typeof output === "string" ? output : output.url || output[0]

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Error transforming image:", error)
    return NextResponse.json({ error: "Failed to transform image" }, { status: 500 })
  }
}
