import { useState } from "react"
import { useShopStore } from "@/store/shopStore"
import { useReviews, useRatingSummary, useReplyToReview } from "@/hooks/useReviews"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Star } from "lucide-react"
import { toast } from "sonner"

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  )
}

function ReplyBox({
  reviewId,
  onSubmit,
  saving,
}: {
  reviewId: string
  onSubmit: (reviewId: string, reply: string) => void
  saving: boolean
}) {
  const [reply, setReply] = useState("")
  return (
    <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
      <Textarea
        placeholder="Write a reply..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        className="resize-none"
      />
      <Button
        size="sm"
        disabled={!reply.trim() || saving}
        onClick={() => onSubmit(reviewId, reply.trim())}
      >
        {saving ? "Posting..." : "Post Reply"}
      </Button>
    </div>
  )
}

export default function ReviewsPage() {
  const shopId = useShopStore((s) => s.selectedShopId)
  const [page, setPage] = useState(0)

  const { data: summary } = useRatingSummary(shopId)
  const { data: reviews, isLoading } = useReviews(shopId, page)
  const replyMutation = useReplyToReview(shopId)

  const handleReply = async (reviewId: string, reply: string) => {
    try {
      await replyMutation.mutateAsync({ reviewId, data: { reply } })
      toast.success("Reply posted")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to post reply")
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">Reviews</h1>
          <p className="text-sm text-muted-foreground">What your customers are saying</p>
        </div>
        {summary && (
          <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-4 py-2 text-sm border border-border/60">
            <StarRow rating={Math.round(summary.averageRating)} />
            <span className="font-semibold">{summary.averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({summary.totalReviews} review{summary.totalReviews === 1 ? "" : "s"})
            </span>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && reviews?.content.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No reviews yet.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {reviews?.content.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <StarRow rating={review.rating} />
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="mt-3 text-sm text-foreground/90 leading-relaxed">{review.comment}</p>
              )}

              {review.ownerReply ? (
                <div className="mt-4 rounded-xl bg-muted/50 p-4 text-sm border border-border/40">
                  <div className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Your reply
                  </div>
                  <p className="text-foreground/80">{review.ownerReply}</p>
                </div>
              ) : (
                <ReplyBox
                  reviewId={review.id}
                  onSubmit={handleReply}
                  saving={replyMutation.isPending}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews && reviews.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={reviews.first}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {reviews.number + 1} of {reviews.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={reviews.last}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}