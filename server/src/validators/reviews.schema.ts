import { z } from "zod";

export const CreateReviewInput = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(1),
});
export type CreateReviewDTO = z.infer<typeof CreateReviewInput>;