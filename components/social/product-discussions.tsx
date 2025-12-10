"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, ThumbsUp, ThumbsDown, Reply, HelpCircle, CheckCircle } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"

interface Discussion {
  id: string
  content: string
  is_question: boolean
  is_answer: boolean
  upvotes_count: number
  downvotes_count: number
  created_at: string
  user: {
    id: string
    full_name: string
    username: string
    profile_image_url: string
    is_verified: boolean
  }
  replies: Discussion[]
}

interface ProductDiscussionsProps {
  productId: string
  sellerId: string
}

export function ProductDiscussions({ productId, sellerId }: ProductDiscussionsProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isQuestion, setIsQuestion] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    fetchDiscussions()
  }, [productId])

  const fetchDiscussions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("product_discussions")
        .select(`
          *,
          users!inner(
            id, full_name, username, profile_image_url, is_verified
          )
        `)
        .eq("product_id", productId)
        .is("parent_id", null)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Fetch replies for each discussion
      const discussionsWithReplies = await Promise.all(
        (data || []).map(async (discussion) => {
          const { data: replies } = await supabase
            .from("product_discussions")
            .select(`
              *,
              users!inner(
                id, full_name, username, profile_image_url, is_verified
              )
            `)
            .eq("parent_id", discussion.id)
            .order("created_at", { ascending: true })

          return {
            ...discussion,
            user: discussion.users,
            replies: replies?.map((reply) => ({ ...reply, user: reply.users })) || [],
          }
        }),
      )

      setDiscussions(discussionsWithReplies)
    } catch (error) {
      console.error("Error fetching discussions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return

    try {
      const { error } = await supabase.from("product_discussions").insert({
        product_id: productId,
        user_id: user.id,
        content: newComment.trim(),
        is_question: isQuestion,
      })

      if (error) throw error

      setNewComment("")
      setIsQuestion(false)
      fetchDiscussions()
    } catch (error) {
      console.error("Error posting comment:", error)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return

    try {
      const { error } = await supabase.from("product_discussions").insert({
        product_id: productId,
        user_id: user.id,
        parent_id: parentId,
        content: replyContent.trim(),
        is_answer: user.id === sellerId, // Mark as answer if seller is replying
      })

      if (error) throw error

      setReplyContent("")
      setReplyingTo(null)
      fetchDiscussions()
    } catch (error) {
      console.error("Error posting reply:", error)
    }
  }

  const handleVote = async (discussionId: string, voteType: "up" | "down") => {
    if (!user) return

    try {
      // This would need a separate votes table in a real implementation
      // For now, just update the counts directly
      const { error } = await supabase.rpc("handle_discussion_vote", {
        discussion_id: discussionId,
        user_id: user.id,
        vote_type: voteType,
      })

      if (error) throw error
      fetchDiscussions()
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Questions & Answers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <span>Questions & Answers</span>
          <Badge variant="secondary">{discussions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        {user && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center space-x-2 mb-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{user.email?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">{user.user_metadata?.full_name || user.email}</span>
            </div>

            <Textarea
              placeholder="Ask a question or leave a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-3"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={isQuestion}
                  onChange={(e) => setIsQuestion(e.target.checked)}
                  className="rounded"
                />
                <HelpCircle className="w-4 h-4" />
                <span>This is a question</span>
              </label>

              <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                Post Comment
              </Button>
            </div>
          </div>
        )}

        {/* Discussions List */}
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <div key={discussion.id} className="border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={discussion.user.profile_image_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {discussion.user.full_name?.charAt(0) || discussion.user.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{discussion.user.full_name}</span>
                    {discussion.user.is_verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                    {discussion.is_question && (
                      <Badge variant="outline" className="text-xs">
                        <HelpCircle className="w-3 h-3 mr-1" />
                        Question
                      </Badge>
                    )}
                    {discussion.user.id === sellerId && (
                      <Badge variant="default" className="text-xs">
                        Seller
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3">{discussion.content}</p>

                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(discussion.id, "up")}
                      className="text-gray-500 hover:text-green-600"
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {discussion.upvotes_count}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(discussion.id, "down")}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      {discussion.downvotes_count}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(replyingTo === discussion.id ? null : discussion.id)}
                      className="text-gray-500"
                    >
                      <Reply className="w-4 h-4 mr-1" />
                      Reply
                    </Button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === discussion.id && user && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-200">
                      <Textarea
                        placeholder="Write your reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="mb-2"
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(discussion.id)}
                          disabled={!replyContent.trim()}
                        >
                          Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyContent("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {discussion.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
                      {discussion.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={reply.user.profile_image_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {reply.user.full_name?.charAt(0) || reply.user.username?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{reply.user.full_name}</span>
                              {reply.user.is_verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                              {reply.is_answer && (
                                <Badge variant="default" className="text-xs bg-green-500">
                                  Answer
                                </Badge>
                              )}
                              {reply.user.id === sellerId && (
                                <Badge variant="default" className="text-xs">
                                  Seller
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {discussions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No questions or comments yet.</p>
            <p className="text-sm">Be the first to ask a question!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
