import { Suspense } from "react"
import Header from "@/components/header"
import CategoryNav from "@/components/category-nav"
import HeroBanner from "@/components/hero-banner"
import FeaturedProducts from "@/components/featured-products"
import CategoryGrid from "@/components/category-grid"
import { createServerClient } from "@/lib/supabase/server"
import Footer from "@/components/footer"
import { User } from "@supabase/supabase-js"

export default async function HomePage() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const typeUser = session?.user as User || null;
  return (
    <div className="min-h-screen bg-gray-50">
      <Header userData={typeUser} />
      <CategoryNav />
      <main>
        <HeroBanner />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
          <Suspense fallback={<div>Loading featured products...</div>}>
            <FeaturedProducts />
          </Suspense>
          <CategoryGrid />
        </div>
      </main>
      <Footer />
    </div>
  )
}
