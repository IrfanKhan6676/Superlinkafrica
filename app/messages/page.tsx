"use client"

import { useState } from "react"
import { ChatList } from "@/components/chat/chat-list"
import { ChatInterface } from "@/components/chat/chat-interface"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle } from "lucide-react"

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-2rem)]">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <ChatList
              onConversationSelect={setSelectedConversationId}
              selectedConversationId={selectedConversationId || undefined}
            />
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            {selectedConversationId ? (
              <ChatInterface conversationId={selectedConversationId} onClose={() => setSelectedConversationId(null)} />
            ) : (
              <Card className="h-full">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                    <p>Choose a conversation from the list to start messaging</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
