
import { z } from "zod";

export const createRoomSchema = z.object({
  slug: z.string().min(4).max(24)
});

export const createChatSchema = z.object({
  message: z.string()
});