import { ShopPage } from '@/pages/ShopPage'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod' 



// define schema for search params, using zod.
const shopSearchSchema = z.object({
  page: z.number().int().min(1).catch(1), 
  limit: z.number().int().min(1).catch(15), // Either 5, 15, 20, or 25
  sort: z.enum(['popularity', 'price-asc', 'price-desc', 'rating']).catch('popularity'), // Default sort 'popularity'
  onSale: z.boolean().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  minRating: z.number().min(1).max(5).optional(),
})

export const Route = createFileRoute('/shop')({
  validateSearch: (search) => shopSearchSchema.parse(search), // Validate search params
  component: ShopPage,
})

export type ShopSearch = z.infer<typeof shopSearchSchema>
