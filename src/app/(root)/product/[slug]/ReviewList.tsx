"use client";

import { useEffect } from "react";
import { Review } from "@/types";
import Link from "next/link";
import { useState } from "react";
import ReviewForm from "./ReviewForm";
import { getReviews } from "@/lib/actions/review";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar, Star, User } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const Rating = ({ value }: { value: number }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < value
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-foreground">
        {value}/5
      </span>
    </div>
  );
};

const ReviewList = ({
  userId,
  productId,
  productSlug,
  firstInitial,
}: {
  userId: string;
  productId: string;
  productSlug: string;
  firstInitial: string;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
  });

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({ productId });
      setReviews(res.data);

      // Calculate stats
      if (res.data.length > 0) {
        const average =
          res.data.reduce(
            (acc, review) => acc + review.rating,
            0
          ) / res.data.length;
        setStats({
          total: res.data.length,
          average: parseFloat(average.toFixed(1)),
        });
      }
    };

    loadReviews();
  }, [productId]);

  // Reload reviews after created or updated
  const reload = async () => {
    const res = await getReviews({ productId });
    setReviews([...res.data]);

    // Update stats
    if (res.data.length > 0) {
      const average =
        res.data.reduce(
          (acc, review) => acc + review.rating,
          0
        ) / res.data.length;
      setStats({
        total: res.data.length,
        average: parseFloat(average.toFixed(1)),
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle>Customer Reviews</CardTitle>
              {reviews.length > 0 ? (
                <CardDescription className="flex items-center gap-3">
                  <Rating value={stats.average} />
                  <span>
                    Based on {stats.total} reviews
                  </span>
                </CardDescription>
              ) : (
                <CardDescription>
                  Be the first to review this product
                </CardDescription>
              )}
            </div>
            <div>
              {userId ? (
                <ReviewForm
                  userId={userId}
                  productId={productId}
                  onReviewSubmitted={reload}
                />
              ) : (
                <div className="bg-secondary/50 p-3 rounded-md border text-sm">
                  Please{" "}
                  <Link
                    className="text-primary font-medium hover:underline"
                    href={`/sign-in?callbackUrl=/product/${productSlug}`}
                  >
                    sign in
                  </Link>{" "}
                  to write a review
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {reviews.length === 0 ? (
        <Card className="border shadow-sm">
          <CardContent className="flex items-center justify-center p-8">
            <p className="text-muted-foreground text-center">
              No reviews yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <Card
              key={review.id}
              className="border shadow-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start">
                  <Button
                    variant="ghost"
                    className="relative w-8 h-8 my-auto  rounded-full flex items-center justify-center bg-primary/10"
                  >
                    {firstInitial}
                  </Button>
                  <div className="space-y-1.5 pl-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">
                        {review.title}
                      </h3>
                      <Rating value={review.rating} />
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <User className="mr-1 h-3.5 w-3.5" />
                        {review.user
                          ? review.user.name
                          : "Anonymous"}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3.5 w-3.5" />
                        {
                          formatDateTime(review.createdAt)
                            .dateTime
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {index < reviews.length - 1 && <Separator />}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
