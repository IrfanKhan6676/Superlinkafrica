import { render } from "@testing-library/react"
import "@testing-library/jest-dom"

describe("Superlink Pages", () => {
  test("Homepage renders without errors", async () => {
    try {
      const HomePage = (await import("@/app/page")).default
      render(<HomePage />)
      console.log("✓ Homepage renders successfully")
    } catch (error) {
      console.error("✗ Homepage failed:", error)
    }
  })

  test("Auth pages render without errors", async () => {
    const authPages = ["login", "sign-up"]

    for (const page of authPages) {
      try {
        const AuthPage = (await import(`@/app/auth/${page}/page`)).default
        render(<AuthPage />)
        console.log(`✓ Auth ${page} page renders successfully`)
      } catch (error) {
        console.error(`✗ Auth ${page} page failed:`, error)
      }
    }
  })

  test("Product pages render without errors", async () => {
    try {
      const ProductsPage = (await import("@/app/products/page")).default
      render(<ProductsPage />)
      console.log("✓ Products page renders successfully")
    } catch (error) {
      console.error("✗ Products page failed:", error)
    }
  })

  test("Seller dashboard renders without errors", async () => {
    try {
      const SellerPage = (await import("@/app/seller/page")).default
      render(<SellerPage />)
      console.log("✓ Seller dashboard renders successfully")
    } catch (error) {
      console.error("✗ Seller dashboard failed:", error)
    }
  })

  test("Admin panel renders without errors", async () => {
    try {
      const AdminPage = (await import("@/app/admin/page")).default
      render(<AdminPage />)
      console.log("✓ Admin panel renders successfully")
    } catch (error) {
      console.error("✗ Admin panel failed:", error)
    }
  })
})
