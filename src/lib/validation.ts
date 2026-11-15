import { z } from "zod";
import { SIZES } from "@/types/product";

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(254),
  address: z.string().trim().min(4, "Please enter your street address").max(300),
  city: z.string().trim().min(2, "Please enter your city").max(100),
  postalCode: z.string().trim().min(3, "Please enter your postal code").max(20),
  country: z.string().trim().min(2, "Please enter your country").max(100),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const orderPayloadSchema = z.object({
  customer: checkoutSchema,
  items: z
    .array(
      z.object({
        productId: z.string().regex(/^[a-z0-9-]{1,100}$/i),
        size: z.enum(SIZES),
        color: z.string().trim().min(1).max(40),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your cart is empty")
    .max(50, "Your cart contains too many different items."),
});

export type OrderPayload = z.infer<typeof orderPayloadSchema>;
