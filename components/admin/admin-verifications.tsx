import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { CheckCircle, XCircle, Eye, Clock, Shield } from "lucide-react"

export default async function AdminVerifications() {
  const supabase = createClient()

  const { data: verifications } = await supabase
    .from("seller_verifications")
    .select(`
      *,
      user:users!seller_verifications_user_id_fkey(full_name, email, phone)
    `)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Verifications</h1>
          <p className="text-gray-600">Review and approve seller verification requests</p>
        </div>
      </div>

      {verifications && verifications.length > 0 ? (
        <div className="space-y-4">
          {verifications.map((verification) => (
            <Card key={verification.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{verification.user?.full_name}</h3>
                      <Badge className={`${getStatusColor(verification.verification_status)} flex items-center gap-1`}>
                        {getStatusIcon(verification.verification_status)}
                        {verification.verification_status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Email:</strong> {verification.user?.email}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Phone:</strong> {verification.user?.phone || "Not provided"}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Business Name:</strong> {verification.business_name || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>NRC/Passport:</strong> {verification.nrc_passport_number}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Submitted:</strong> {new Date(verification.created_at).toLocaleDateString()}
                        </p>
                        {verification.verified_at && (
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Verified:</strong> {new Date(verification.verified_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {verification.rejection_reason && (
                      <div className="bg-red-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {verification.rejection_reason}
                        </p>
                      </div>
                    )}

                    {verification.document_image_url && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Submitted Document:</p>
                        <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Shield className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Document
                    </Button>

                    {verification.verification_status === "pending" && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <Shield className="h-12 w-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No verification requests</h3>
              <p className="text-gray-600">Seller verification requests will appear here</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
