"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Send,
  ImageIcon,
  Paperclip,
  MoreVertical,
  Shield,
  AlertTriangle,
  Check,
  CheckCheck,
  DollarSign,
} from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

interface Message {
  id: string
  content: string
  message_type: "text" | "image" | "file" | "offer" | "system"
  media_url?: string
  metadata?: Record<string, any>
  is_read: boolean
  is_edited: boolean
  created_at: string
  sender: {
    id: string
    full_name: string
    profile_image_url: string
  }
}

interface Conversation {
  id: string
  product_id: string
  buyer_id: string
  seller_id: string
  status: "active" | "archived" | "blocked"
  last_message_at: string
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

interface ChatInterfaceProps {
  conversationId: string
  onClose?: () => void
}

export function ChatInterface({ conversationId, onClose }: ChatInterfaceProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [offerAmount, setOfferAmount] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    if (conversationId) {
      fetchConversation()
      fetchMessages()
      setupRealtimeSubscription()
    }

    return () => {
      // Cleanup subscription
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversation = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          products!inner(id, title, price, product_media(media_url)),
          buyer:users!buyer_id(id, full_name, profile_image_url, is_verified),
          seller:users!seller_id(id, full_name, profile_image_url, is_verified)
        `)
        .eq("id", conversationId)
        .single()

      if (error) throw error

      const otherUser = data.buyer_id === user?.id ? data.seller : data.buyer

      setConversation({
        ...data,
        product: {
          ...data.products,
          images: data.products.product_media?.map((m: any) => m.media_url) || [],
        },
        other_user: otherUser,
      })
    } catch (error) {
      console.error("Error fetching conversation:", error)
    }
  }

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:users!sender_id(id, full_name, profile_image_url)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) throw error

      setMessages(
        data.map((msg) => ({
          ...msg,
          sender: msg.sender,
        })),
      )

      // Mark messages as read
      if (user) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_id", user.id)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Fetch the complete message with sender info
          fetchMessageWithSender(payload.new.id)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => prev.map((msg) => (msg.id === payload.new.id ? { ...msg, ...payload.new } : msg)))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const fetchMessageWithSender = async (messageId: string) => {
    const { data } = await supabase
      .from("messages")
      .select(`
        *,
        sender:users!sender_id(id, full_name, profile_image_url)
      `)
      .eq("id", messageId)
      .single()

    if (data) {
      setMessages((prev) => [...prev, { ...data, sender: data.sender }])
    }
  }

  const sendMessage = async (type: "text" | "offer" = "text", content?: string, metadata?: Record<string, any>) => {
    if (!user || !conversation) return

    const messageContent = content || newMessage.trim()
    if (!messageContent && type === "text") return

    try {
      setSending(true)

      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message_type: type,
        content: messageContent,
        metadata: metadata || {},
      })

      if (error) throw error

      if (type === "text") {
        setNewMessage("")
      }

      // Update conversation last message time
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const sendOffer = async () => {
    if (!offerAmount || !conversation) return

    const amount = Number.parseFloat(offerAmount)
    if (isNaN(amount) || amount <= 0) return

    await sendMessage("offer", `Offered ZMW ${amount.toLocaleString()}`, {
      offer_amount: amount,
      product_id: conversation.product_id,
      original_price: conversation.product.price,
    })

    setOfferAmount("")
    setShowOfferForm(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    try {
      setSending(true)

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage.from("chat-media").upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from("chat-media").getPublicUrl(fileName)

      // Send message with file
      await sendMessage(file.type.startsWith("image/") ? "image" : "file", file.name, {
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      })
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getMessageStatus = (message: Message) => {
    if (message.sender.id !== user?.id) return null

    if (message.is_read) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />
    } else {
      return <Check className="w-3 h-3 text-gray-400" />
    }
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "now"
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!conversation) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Conversation not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Chat Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={conversation.other_user.profile_image_url || "/placeholder.svg"} />
              <AvatarFallback>{conversation.other_user.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{conversation.other_user.full_name}</h3>
                {conversation.other_user.is_verified && <Shield className="w-4 h-4 text-blue-500" />}
              </div>
              <p className="text-sm text-gray-500">
                About: {conversation.product.title.substring(0, 30)}
                {conversation.product.title.length > 30 ? "..." : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <AlertTriangle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
            {conversation.product.images[0] && (
              <Image
                src={conversation.product.images[0] || "/placeholder.svg"}
                alt={conversation.product.title}
                width={48}
                height={48}
                className="object-cover"
              />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{conversation.product.title}</h4>
            <p className="text-lg font-bold text-blue-600">ZMW {conversation.product.price.toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>

      <Separator />

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender.id === user?.id
          const isOffer = message.message_type === "offer"

          return (
            <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`flex space-x-2 max-w-xs lg:max-w-md ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}>
                {!isOwn && (
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={message.sender.profile_image_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{message.sender.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`rounded-lg px-3 py-2 ${
                    isOwn ? "bg-blue-600 text-white" : isOffer ? "bg-green-100 border border-green-200" : "bg-gray-100"
                  }`}
                >
                  {message.message_type === "image" && message.metadata?.file_url && (
                    <div className="mb-2">
                      <Image
                        src={message.metadata.file_url || "/placeholder.svg"}
                        alt="Shared image"
                        width={200}
                        height={150}
                        className="rounded object-cover"
                      />
                    </div>
                  )}

                  {isOffer && (
                    <div className="flex items-center space-x-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-700">Offer</span>
                    </div>
                  )}

                  <p className={`text-sm ${isOwn && !isOffer ? "text-white" : "text-gray-900"}`}>{message.content}</p>

                  <div className={`flex items-center justify-between mt-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                    <span className={`text-xs ${isOwn && !isOffer ? "text-blue-100" : "text-gray-500"}`}>
                      {formatMessageTime(message.created_at)}
                    </span>
                    {isOwn && <div className="ml-2">{getMessageStatus(message)}</div>}
                  </div>

                  {isOffer && !isOwn && (
                    <div className="flex space-x-2 mt-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Accept
                      </Button>
                      <Button size="sm" variant="outline">
                        Counter
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {otherUserTyping && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Avatar className="w-6 h-6">
              <AvatarImage src={conversation.other_user.profile_image_url || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">{conversation.other_user.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="bg-gray-100 rounded-lg px-3 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <Separator />

      {/* Offer Form */}
      {showOfferForm && (
        <div className="p-4 bg-green-50 border-t border-green-200">
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Enter offer amount"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              className="flex-1"
            />
            <Button onClick={sendOffer} disabled={!offerAmount} className="bg-green-600 hover:bg-green-700">
              Send Offer
            </Button>
            <Button variant="outline" onClick={() => setShowOfferForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            className="text-gray-500"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            className="text-gray-500"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOfferForm(!showOfferForm)}
            disabled={sending}
            className="text-gray-500"
          >
            <DollarSign className="w-4 h-4" />
          </Button>

          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={sending}
            className="flex-1"
          />

          <Button onClick={() => sendMessage()} disabled={sending || !newMessage.trim()} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </Card>
  )
}
