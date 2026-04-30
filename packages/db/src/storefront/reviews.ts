import { getDb, hasDatabaseUrl } from "../client";

export type SubmitReviewInput = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  content?: string;
};

export async function submitReview(input: SubmitReviewInput) {
  const supabase = getDb();
  const { data: newReview, error } = await supabase
    .from("reviews")
    .insert({
      order_id: input.orderId,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      rating: input.rating,
      content: input.content || null,
      is_approved: false, // all reviews require approval
    })
    .select()
    .single();

  if (error || !newReview) throw new Error("Failed to submit review.");

  return {
    id: newReview.id,
    orderId: newReview.order_id,
    customerName: newReview.customer_name,
    customerEmail: newReview.customer_email,
    rating: newReview.rating,
    content: newReview.content,
    isApproved: newReview.is_approved,
    createdAt: new Date(newReview.created_at),
  };
}

export async function getApprovedReviews(limitCount = 10) {
  if (!hasDatabaseUrl()) return [];

  const supabase = getDb();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      customer_name,
      rating,
      content,
      created_at
    `,
    )
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(limitCount);

  if (error || !reviews) return [];

  return reviews.map((r: any) => ({
    id: r.id,
    customerName: r.customer_name,
    rating: r.rating,
    content: r.content,
    createdAt: new Date(r.created_at),
  }));
}

export async function getDashboardReviews(limitCount = 50, offsetCount = 0) {
  const supabase = getDb();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      order_id,
      customer_name,
      customer_email,
      rating,
      content,
      is_approved,
      created_at,
      order:orders(order_code)
    `,
    )
    .order("created_at", { ascending: false })
    .range(offsetCount, offsetCount + limitCount - 1);

  if (error || !reviews) return [];

  return reviews.map((r: any) => ({
    id: r.id,
    orderId: r.order_id,
    orderCode: r.order?.order_code ?? null,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    rating: r.rating,
    content: r.content,
    isApproved: r.is_approved,
    createdAt: new Date(r.created_at),
  }));
}

export async function updateReviewStatus(id: string, isApproved: boolean) {
  const supabase = getDb();
  const { data: updated, error } = await supabase
    .from("reviews")
    .update({ is_approved: isApproved })
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) throw new Error("Failed to update review status.");

  return {
    id: updated.id,
    orderId: updated.order_id,
    customerName: updated.customer_name,
    customerEmail: updated.customer_email,
    rating: updated.rating,
    content: updated.content,
    isApproved: updated.is_approved,
    createdAt: new Date(updated.created_at),
  };
}

export async function deleteReview(id: string) {
  const supabase = getDb();
  const { data: deleted, error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error || !deleted) throw new Error("Failed to delete review.");

  return {
    id: deleted.id,
    orderId: deleted.order_id,
    customerName: deleted.customer_name,
    customerEmail: deleted.customer_email,
    rating: deleted.rating,
    content: deleted.content,
    isApproved: deleted.is_approved,
    createdAt: new Date(deleted.created_at),
  };
}
