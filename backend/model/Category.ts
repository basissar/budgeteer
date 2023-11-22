import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
export interface Category {
    id: bigint;
    name: string;
    userId: bigint;
}

export const categorySchema = z.object({
    id: z.bigint(),
    name: z.string()
        .min(3, { message: "Name is too short." })
        .max(20, { message: "Name is too long." }),
    userId: z.bigint()
})

