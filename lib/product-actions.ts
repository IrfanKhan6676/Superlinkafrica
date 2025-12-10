"use server"

import { createWritableServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createProduct(formData: FormData) {
  const supabase = await createWritableServerClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in to create a product" }
  }

  try {
    // Extract form data
    const title = formData.get("title")?.toString()
    const description = formData.get("description")?.toString()
    const categoryId = formData.get("category_id")?.toString()
    const condition = formData.get("condition")?.toString()
    const location = formData.get("location")?.toString()
    const listingType = formData.get("listing_type")?.toString()
    const price = formData.get("price")?.toString()
    const startingBid = formData.get("starting_bid")?.toString()
    const buyNowPrice = formData.get("buy_now_price")?.toString()
    const quantity = formData.get("quantity")?.toString()

    if (!title || !description || !categoryId || !condition || !location || !listingType) {
      return { error: "Please fill in all required fields" }
    }

    // Create product
    const productData: any = {
      seller_id: user.id,
      title,
      description,
      category_id: categoryId,
      condition,
      location,
      listing_type: listingType,
      quantity: Number.parseInt(quantity || "1"),
      status: "active",
    }

    if (listingType === "fixed") {
      if (!price) {
        return { error: "Price is required for fixed price listings" }
      }
      productData.price = Number.parseFloat(price)
    } else {
      if (!startingBid) {
        return { error: "Starting bid is required for auction listings" }
      }
      productData.starting_bid = Number.parseFloat(startingBid)
      productData.current_bid = Number.parseFloat(startingBid)
      if (buyNowPrice) {
        productData.buy_now_price = Number.parseFloat(buyNowPrice)
      }
      // Set auction end date to 7 days from now
      const auctionEndDate = new Date()
      auctionEndDate.setDate(auctionEndDate.getDate() + 7)
      productData.auction_end_date = auctionEndDate.toISOString()
    }

    const { data: product, error: productError } = await supabase.from("products").insert(productData).select().single()

    if (productError) {
      console.error("Product creation error:", productError)
      return { error: "Failed to create product" }
    }

    // ...existing code...
    // Handle image uploads (upload to Supabase Storage and save URLs)
    const bucket = 'product-images' // ensure this bucket exists and has correct policies
    const imageFiles: any[] = []

    for (let i = 0; i < 5; i++) {
      const imageFile = formData.get(`image_${i}`) as File | null
      if (!imageFile || imageFile.size === 0) continue

      // create a unique path, e.g. productId/timestamp_filename
      const filename = `${product.id}/${Date.now()}_${i}_${imageFile.name}`

      try {
        // upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("Product-Images")
          .upload(filename, imageFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: imageFile.type,
          })

        if (uploadError) {
          console.error('Storage upload error:', uploadError)
          // fallback: use placeholder URL
          imageFiles.push({
            product_id: product.id,
            image_url: `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(title)}`,
            is_primary: i === 0,
            sort_order: i,
          })
          continue
        }

        // get public URL (or createSignedUrl if you want temporary access)
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filename)

        const imageUrl = publicUrlData?.publicUrl ?? `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(title)}`

        imageFiles.push({
          product_id: product.id,
          image_url: imageUrl,
          is_primary: i === 0,
          sort_order: i,
        })
      } catch (err) {
        console.error('Image upload exception:', err)
        imageFiles.push({
          product_id: product.id,
          image_url: `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(title)}`,
          is_primary: i === 0,
          sort_order: i,
        })
      }
    }

    if (imageFiles.length > 0) {
      await supabase.from('product_images').insert(imageFiles)
    }
// ...existing code...

    revalidatePath("/products")
    return { success: true, productId: product.id }
  } catch (error) {
    console.error("Error creating product:", error)
    return { error: "An unexpected error occurred" }
  }
}
