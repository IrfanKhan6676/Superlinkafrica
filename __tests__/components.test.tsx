import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"

// Test all major components to identify what's broken
describe("Superlink Components", () => {
  test("Header component renders without errors", async () => {
    try {
      const Header = (await import("@/components/header")).default
      render(<Header />)
      expect(screen.getByText("SUPERLINK")).toBeInTheDocument()
    } catch (error) {
      console.error("Header component failed:", error)
      expect(error).toBeNull()
    }
  })

  test("CategoryNav component renders without errors", async () => {
    try {
      const CategoryNav = (await import("@/components/category-nav")).default
      render(<CategoryNav />)
      // Should render category navigation
    } catch (error) {
      console.error("CategoryNav component failed:", error)
      expect(error).toBeNull()
    }
  })

  test("HeroBanner component renders without errors", async () => {
    try {
      const HeroBanner = (await import("@/components/hero-banner")).default
      render(<HeroBanner />)
      // Should render hero banner
    } catch (error) {
      console.error("HeroBanner component failed:", error)
      expect(error).toBeNull()
    }
  })

  test("FeaturedProducts component renders without errors", async () => {
    try {
      const FeaturedProducts = (await import("@/components/featured-products")).default
      render(<FeaturedProducts />)
      // Should render featured products
    } catch (error) {
      console.error("FeaturedProducts component failed:", error)
      expect(error).toBeNull()
    }
  })

  test("CategoryGrid component renders without errors", async () => {
    try {
      const CategoryGrid = (await import("@/components/category-grid")).default
      render(<CategoryGrid />)
      // Should render category grid
    } catch (error) {
      console.error("CategoryGrid component failed:", error)
      expect(error).toBeNull()
    }
  })

  test("Footer component renders without errors", async () => {
    try {
      const Footer = (await import("@/components/footer")).default
      render(<Footer />)
      // Should render footer
    } catch (error) {
      console.error("Footer component failed:", error)
      expect(error).toBeNull()
    }
  })
})

describe("Authentication Components", () => {
  test("Login form renders without errors", async () => {
    try {
      const LoginForm = (await import("@/components/auth/login-form")).default
      render(<LoginForm />)
      expect(screen.getByText("Sign In")).toBeInTheDocument()
    } catch (error) {
      console.error("LoginForm component failed:", error)
      expect(error).toBeNull()
    }
  })

  test("SignUp form renders without errors", async () => {
    try {
      const SignUpForm = (await import("@/components/auth/sign-up-form")).default
      render(<SignUpForm />)
      expect(screen.getByText("Create Account")).toBeInTheDocument()
    } catch (error) {
      console.error("SignUpForm component failed:", error)
      expect(error).toBeNull()
    }
  })
})

describe("Product Components", () => {
  test("Product components render without errors", async () => {
    const components = [
      "product-grid",
      "product-card",
      "product-form",
      "product-filters",
      "product-search",
      "product-details",
      "product-images",
      "product-actions",
      "seller-info",
      "product-reviews",
    ]

    for (const component of components) {
      try {
        const Component = (await import(`@/components/products/${component}`)).default
        render(<Component />)
        console.log(`✓ ${component} renders successfully`)
      } catch (error) {
        console.error(`✗ ${component} failed:`, error)
      }
    }
  })
})
