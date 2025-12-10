"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Shield, User, Eye, CheckCircle, XCircle } from "lucide-react"

interface FraudAlert {
  id: string
  user_id: string
  alert_type: string
  severity: string
  description: string
  evidence: any
  status: string
  created_at: string
  user?: {
    email: string
    full_name: string
  }
}

export function FraudDetectionDashboard() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null)

  useEffect(() => {
    fetchFraudAlerts()
  }, [])

  const fetchFraudAlerts = async () => {
    try {
      const response = await fetch("/api/admin/fraud-alerts")
      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error("Failed to fetch fraud alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAlertAction = async (alertId: string, action: "resolve" | "investigate" | "false_positive") => {
    try {
      await fetch(`/api/admin/fraud-alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      })

      fetchFraudAlerts() // Refresh alerts
      setSelectedAlert(null)
    } catch (error) {
      console.error("Failed to update alert:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "fake_name":
        return <User className="h-4 w-4" />
      case "duplicate_id":
        return <Shield className="h-4 w-4" />
      case "suspicious_behavior":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading fraud detection data...</div>
  }

  const openAlerts = alerts.filter((a) => a.status === "open")
  const criticalAlerts = alerts.filter((a) => a.severity === "critical")

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{criticalAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Open Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{openAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Alerts</p>
                <p className="text-2xl font-bold text-blue-600">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {alerts.filter((a) => a.status === "resolved").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Fraud Detection Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open" className="w-full">
            <TabsList>
              <TabsTrigger value="open">Open Alerts ({openAlerts.length})</TabsTrigger>
              <TabsTrigger value="all">All Alerts ({alerts.length})</TabsTrigger>
              <TabsTrigger value="critical">Critical ({criticalAlerts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="space-y-4">
              {openAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.alert_type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getSeverityColor(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                          <span className="text-sm text-gray-500">
                            {alert.alert_type.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <AlertDescription className="text-sm">{alert.description}</AlertDescription>
                        <p className="text-xs text-gray-500 mt-1">
                          User: {alert.user?.email || alert.user_id} •{new Date(alert.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Investigate
                    </Button>
                  </div>
                </Alert>
              ))}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {alerts.map((alert) => (
                <Alert
                  key={alert.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.alert_type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getSeverityColor(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                          <Badge variant={alert.status === "resolved" ? "default" : "secondary"}>
                            {alert.status.toUpperCase()}
                          </Badge>
                        </div>
                        <AlertDescription className="text-sm">{alert.description}</AlertDescription>
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </TabsContent>

            <TabsContent value="critical" className="space-y-4">
              {criticalAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  className="border-red-200 bg-red-50 cursor-pointer hover:bg-red-100"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <AlertDescription className="text-sm font-medium text-red-800">
                        {alert.description}
                      </AlertDescription>
                      <p className="text-xs text-red-600 mt-1">
                        {alert.alert_type.replace("_", " ").toUpperCase()} •
                        {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Urgent Action Required
                    </Button>
                  </div>
                </Alert>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Alert Details</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedAlert(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <Badge className={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="text-sm">{selectedAlert.alert_type.replace("_", " ")}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm mt-1">{selectedAlert.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Evidence</label>
                <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-x-auto">
                  {JSON.stringify(selectedAlert.evidence, null, 2)}
                </pre>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => handleAlertAction(selectedAlert.id, "resolve")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolve
                </Button>
                <Button variant="outline" onClick={() => handleAlertAction(selectedAlert.id, "investigate")}>
                  <Eye className="h-4 w-4 mr-2" />
                  Investigate
                </Button>
                <Button variant="secondary" onClick={() => handleAlertAction(selectedAlert.id, "false_positive")}>
                  False Positive
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
