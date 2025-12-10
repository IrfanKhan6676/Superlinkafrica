# Products CRUD (Next.js + Supabase)

This document describes the database schema, API routes, auth/authorization model, and example frontend integration for the Products CRUD in this repository.

## Database Schema

Tables are defined in `supabase/schema.sql`:

- `public.users` (profile table; `id` references `auth.users.id`)
- `public.businesses` (B2B owner records)
- `public.products` (marketplace products)
- `public.orders` (simplified order record)
- `public.messages` (C2C/B2B messaging)

Important relationships:

- `products.user_id -> users.id`
- `orders.user_id -> users.id`
- `messages.sender_id, messages.receiver_id -> users.id`

Product columns include: `title`, `description`, `price`, `image_url`, `created_at`, `updated_at`.

Row-Level Security (RLS) is enabled with policies:

- Products are publicly readable.
- Only the owner (`auth.uid() = user_id`) can insert, update, delete.

Optional storage bucket `products` is created with public read access and authenticated uploads. Files should be stored under `${auth.uid()}/...`.

## Environment Variables

Required in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)

## Auth & Authorization

Supabase Auth is integrated via helpers in `lib/supabase/` and middleware in `middleware.ts` and `lib/supabase/middleware.ts`.

- Public users can read products.
- Only authenticated users can create/update/delete products.
- Only the product owner can modify or delete their products (enforced by code and RLS).

## API Routes

All routes live under `app/api/products/`.

- `GET /api/products`
  - Query params: `page`, `limit`, `sort` (e.g., `created_at.desc`), `q`, `priceMin`, `priceMax`.
  - Returns `{ data, page, limit, total }`.
- `POST /api/products`
  - Auth required.
  - Body: `{ title: string, description?: string, price: number, image_url?: string | null }`.
  - Returns created product as `{ data }`.
- `GET /api/products/[id]`
  - Returns `{ data }` or 404.
- `PATCH /api/products/[id]`
  - Auth + ownership required.
  - Partial update; validates `price` when provided.
  - Returns updated `{ data }`.
- `PUT /api/products/[id]`
  - Auth + ownership required.
  - Full update; validates required fields.
  - Returns updated `{ data }`.
- `DELETE /api/products/[id]`
  - Auth + ownership required.
  - Returns `{ success: true }`.
- `POST /api/products/bulk`
  - Auth required. Create up to 100 products at once with `items: [...]` payload.
- `PATCH /api/products/bulk`
  - Auth + ownership required. Update many by `updates: [{ id, ...fields }]`.
- `DELETE /api/products/bulk`
  - Auth + ownership required. Delete many by `ids: string[]`.
- `POST /api/products/upload`
  - Auth required. `multipart/form-data` with `file` field.
  - Uploads to storage bucket `products` at `${user.id}/<uuid>.<ext>` and returns `{ path, publicUrl }`.

## Frontend Integration

Pages under `app/products/` demonstrate usage:

- `app/products/page.tsx` – marketplace listing using `GET /api/products` with filters/sorting.
- `app/products/[id]/page.tsx` – product detail with owner-only edit/delete UI.
- `app/products/new/page.tsx` – creation form for authenticated users.

Components:

- `components/products/ProductForm.tsx` – create/edit form using `POST` and `PATCH`.
- `components/products/DeleteButton.tsx` – delete action using `DELETE`.
- `components/products/product-grid.tsx` – listing grid consuming `/api/products`.

## Setup

1. Configure `.env.local` with Supabase project keys.
2. Apply SQL:
   - Run `supabase/schema.sql` against your Supabase project (or via the Supabase SQL editor).
3. Start the app:
   - `npm install`
   - `npm run dev`

## Error Handling

- Standard HTTP codes: 200, 201, 400, 401, 403, 404.
- Responses include `{ error: string }` when not OK.
- Inputs are sanitized and validated server-side.

## Bonus Features

- Search, filtering, sorting supported on listing endpoint.
- Bulk operations endpoints available for B2B sellers.

## Testing

Minimal tests are located in `__tests__/` and focus on route presence and basic contract. For end-to-end validation, prefer integration tests with mocked Supabase clients or API tests in a running environment.
