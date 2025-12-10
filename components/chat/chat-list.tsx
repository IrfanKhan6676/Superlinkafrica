"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Search, MoreVertical, Shield } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"

interface Conversation {
  id: string
  product_id: string
  status: "active" | "archived" | "blocked"
  last_message_at: string
  unread_count: number
  last_message: {
    content: string
    message_type: string
    sender_id: string
  }
  product: {
    id: string
    title: string
    price: number
    images: string[]
  }
  other_user: {
    id: string
    full_name: string
    profile_image_url: string
    is_verified: boolean
  }
}

interface ChatListProps {
  onConversationSelect: (conversationId: string) => void
  selectedConversationId?: string
}

export function ChatList({ onConversationSelect, selectedConversationId }: ChatListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all")
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchConversations()
      setupRealtimeSubscription()
    }
  }, [user, filter])

  const fetchConversations = async () => {
    if (!user) return

    try {
      setLoading(true)

      let query = supabase
        .from("conversations")
        .select(`
          *,
          products!inner(id, title, price, product_media(media_url)),
          buyer:users!buyer_id(id, full_name, profile_image_url, is_verified),
          seller:users!seller_id(id, full_name, profile_image_url, is_verified),
          messages!inner(content, message_type, sender_id, created_at)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false })

      if (filter === "archived") {
        query = query.eq("status", "archived")
      } else if (filter === "unread") {
        // This would need a more complex query to check for unread messages
        query = query.eq("status", "active")
      } else {
        query = query.eq("status", "active")
      }

      const { data, error } = await query

      if (error) throw error

      // Process conversations to get the latest message and other user info
      const processedConversations = await Promise.all(
        (data || []).map(async (conv) => {
          const otherUser = conv.buyer_id === user.id ? conv.seller : conv.buyer

          // Get latest message
          const { data: latestMessage } = await supabase
            .from("messages")
            .select("content, message_type, sender_id")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          // Get unread count
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("is_read", false)
            .neq("sender_id", user.id)

          return {
            ...conv,
            other_user: otherUser,
            product: {
              ...conv.products,
              images: conv.products.product_media?.map((m: any) => m.media_url) || [],
            },
            last_message: latestMessage || { content: "", message_type: "text", sender_id: "" },
            unread_count: unreadCount || 0,
          }
        }),
      )

      setConversations(processedConversations)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    if (!user) return

    const channel = supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          // Refresh conversations when new messages arrive
          fetchConversations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const getLastMessagePreview = (conversation: Conversation) => {
    const { last_message } = conversation
    const isOwn = last_message.sender_id === user?.id

    if (last_message.message_type === "image") {
      return `${isOwn ? "You" : conversation.other_user.full_name} sent an image`
    } else if (last_message.message_type === "offer") {
      return `${isOwn ? "You" : conversation.other_user.full_name} made an offer`
    } else if (last_message.message_type === "file") {
      return `${isOwn ? "You" : conversation.other_user.full_name} sent a file`
    }

    const preview = last_message.content || "No messages yet"
    return preview.length > 50 ? `${preview.substring(0, 50)}...` : preview
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.product.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Messages
          </CardTitle>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="text-xs"
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className="text-xs"
          >
            Unread
          </Button>
          <Button
            variant={filter === "archived" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("archived")}
            className="text-xs"
          >
            Archived
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-1">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                selectedConversationId === conversation.id ? "bg-blue-50 border-l-blue-500" : "border-l-transparent"
              }`}
              onClick={() => onConversationSelect(conversation.id)}
            >
              <div className="flex space-x-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.other_user.profile_image_url || "/placeholder.svg"} />
                    <AvatarFallback>{conversation.other_user.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {conversation.other_user.is_verified && (
                    <Shield className="absolute -bottom-1 -right-1 w-4 h-4 text-blue-500 bg-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm truncate">{conversation.other_user.full_name}</h3>
                    <div className="flex items-center space-x-2">
                      {conversation.unread_count > 0 && (
                        <Badge variant="default" className="bg-blue-600 text-xs px-2 py-1">
                          {conversation.unread_count}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 truncate mb-2">{getLastMessagePreview(conversation)}</p>

                  {/* Product Info */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      {conversation.product.images[0] && (
                        <Image
                          src={conversation.product.images[0] || "/placeholder.svg"}
                          alt={conversation.product.title}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 truncate">{conversation.product.title}</p>
                      <p className="text-xs font-semibold text-blue-600">
                        ZMW {conversation.product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredConversations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No conversations found</p>
            <p className="text-sm">Start chatting with sellers to see conversations here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
