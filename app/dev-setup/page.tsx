import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signUp } from "@/lib/actions"

export default function DevSetupPage() {
  async function createTestUsers() {
    "use server"

    // Create first test user
    const formData1 = new FormData()
    formData1.append("email", "joshuamuhali95@gmail.com")
    formData1.append("password", "Josh2284256")
    formData1.append("confirmPassword", "Josh2284256")
    formData1.append("fullName", "Joshua Muhali")
    formData1.append("phone", "+260977123456")
    formData1.append("role", "seller")

    await signUp(null, formData1)

    // Create second test user
    const formData2 = new FormData()
    formData2.append("email", "Charlesmsuccess@gmail.com")
    formData2.append("password", "msuccess2287")
    formData2.append("confirmPassword", "msuccess2287")
    formData2.append("fullName", "Charles Success")
    formData2.append("phone", "+260966789012")
    formData2.append("role", "seller")

    await signUp(null, formData2)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Development Setup</CardTitle>
          <CardDescription>Create test users for development and testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Test Users:</h3>
            <div className="text-sm space-y-1">
              <p>
                <strong>User 1:</strong> joshuamuhali95@gmail.com / Josh2284256
              </p>
              <p>
                <strong>User 2:</strong> Charlesmsuccess@gmail.com / msuccess2287
              </p>
            </div>
          </div>

          <form action={createTestUsers}>
            <Button type="submit" className="w-full">
              Create Test Users
            </Button>
          </form>

          <div className="text-xs text-gray-600 space-y-1">
            <p>1. Click "Create Test Users" above</p>
            <p>2. Check email inboxes for confirmation links</p>
            <p>3. Click confirmation links to verify accounts</p>
            <p>4. Run the seed script to add test data</p>
            <p>5. Login with the credentials above</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
