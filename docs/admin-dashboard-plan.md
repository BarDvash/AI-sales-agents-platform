# Admin Dashboard - Incremental Implementation Plan

This document breaks down the Admin Dashboard (Step 4) into small, testable milestones. Each milestone is a single commit with clear acceptance criteria.

---

## Overview

**Goal:** Web UI that gives a non-technical business owner visibility into their AI agent's performance.

**Tech Stack:**
- Backend: FastAPI (existing) + new admin routes
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS

**Total Milestones:** 7

---

## Milestone 1: Admin API - Conversations Endpoints

**Goal:** Backend endpoints for conversation data

**Files to create/modify:**
```
api/routes/admin.py          # NEW - all admin endpoints
api/main.py                  # Register admin router
storage/repositories/conversation_repo.py  # Add query methods if needed
```

**Endpoints:**
```
GET /admin/{tenant_id}/conversations
    → Returns: [{id, chat_id, customer_name, last_message, last_message_at, message_count}]

GET /admin/{tenant_id}/conversations/{conversation_id}
    → Returns: {id, chat_id, messages: [{role, content, created_at}], customer, orders}
```

**Acceptance Criteria:**
```bash
# List conversations
curl http://localhost:8000/admin/valdman/conversations | jq

# Get single conversation (use real ID from list)
curl http://localhost:8000/admin/valdman/conversations/1 | jq
```

**Dependencies:** None (uses existing database)

---

## Milestone 2: Admin API - Orders & Customers Endpoints

**Goal:** Complete the admin API with orders and customer endpoints

**Files to modify:**
```
api/routes/admin.py          # Add orders + customers endpoints
storage/repositories/order_repo.py     # Add filter methods if needed
storage/repositories/customer_repo.py  # Add query methods if needed
```

**Endpoints:**
```
GET /admin/{tenant_id}/orders
    → Query params: ?status=pending&customer_id=X
    → Returns: [{id, customer_name, items, status, total, created_at}]

GET /admin/{tenant_id}/orders/{order_id}
    → Returns: {id, customer, items, status, delivery_notes, created_at, updated_at}

GET /admin/{tenant_id}/customers/{customer_id}
    → Returns: {id, name, address, language, notes, created_at}
```

**Acceptance Criteria:**
```bash
# List orders
curl http://localhost:8000/admin/valdman/orders | jq

# Filter by status
curl "http://localhost:8000/admin/valdman/orders?status=pending" | jq

# Get single order
curl http://localhost:8000/admin/valdman/orders/1 | jq

# Get customer
curl http://localhost:8000/admin/valdman/customers/1 | jq
```

**Dependencies:** Milestone 1

---

## Milestone 3: Next.js Scaffold

**Goal:** Empty Next.js app with Tailwind, routing structure, and API client

**Files to create:**
```
admin-ui/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (html, body, fonts)
│   │   ├── page.tsx                # Redirect to /valdman
│   │   └── [tenant]/
│   │       ├── layout.tsx          # Tenant layout (header, nav tabs)
│   │       └── page.tsx            # Redirect to /[tenant]/conversations
│   └── lib/
│       └── api.ts                  # API client (fetch wrapper)
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── .env.local.example              # API_URL=http://localhost:8000
```

**Acceptance Criteria:**
```bash
cd admin-ui
npm install
npm run dev
# → Browser opens http://localhost:3000
# → Redirects to /valdman
# → Shows header with "Valdman" and tabs [Conversations] [Orders]
# → Tabs are clickable (even if pages are empty)
```

**Dependencies:** None (can be done in parallel with Milestones 1-2)

---

## Milestone 4: Conversations List Page

**Goal:** Left sidebar showing all conversations, sorted by most recent

**Files to create/modify:**
```
admin-ui/src/
├── app/[tenant]/conversations/
│   └── page.tsx                    # Conversations page
├── components/
│   └── ConversationList.tsx        # List component
└── lib/
    └── types.ts                    # TypeScript interfaces
```

**UI Spec:**
```
┌─────────────────────────────────────────────┐
│  Valdman          [Conversations] [Orders]  │
├─────────────────────────────────────────────┤
│ ┌─────────────────┐                         │
│ │ David           │  Select a conversation  │
│ │ "אני רוצה..."   │  to view details        │
│ │ 2 minutes ago   │                         │
│ ├─────────────────┤                         │
│ │ Moshe           │                         │
│ │ "תודה רבה"      │                         │
│ │ 1 hour ago      │                         │
│ └─────────────────┘                         │
└─────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- Fetches from `/admin/{tenant}/conversations`
- Shows customer name (or chat_id if no name)
- Shows truncated last message (50 chars)
- Shows relative time ("2m ago", "1h ago")
- Sorted by most recent first
- Clicking a conversation navigates to detail page

**Dependencies:** Milestones 1, 3

---

## Milestone 5: Conversation Detail View

**Goal:** Full conversation thread with customer profile and orders sidebar

**Files to create/modify:**
```
admin-ui/src/
├── app/[tenant]/conversations/
│   └── [id]/
│       └── page.tsx                # Detail page
├── components/
│   ├── ConversationDetail.tsx      # Message thread (WhatsApp-style)
│   ├── CustomerProfile.tsx         # Profile card
│   └── CustomerOrders.tsx          # Orders list for this customer
```

**UI Spec:**
```
┌─────────────────────────────────────────────────────────────┐
│  Valdman                    [Conversations] [Orders]        │
├──────────────────┬──────────────────────────────────────────┤
│ David        ←   │  ┌────────────────────────────────────┐  │
│ Moshe            │  │ Customer: היי, מה יש לכם?          │  │
│ Sarah            │  │ Agent: שלום! יש לנו...             │  │
│                  │  │ Customer: אני רוצה 2 קילו          │  │
│                  │  │ Agent: מצוין! ההזמנה נוצרה         │  │
│                  │  └────────────────────────────────────┘  │
│                  │                                          │
│                  │  ┌─────────────┐ ┌────────────────────┐  │
│                  │  │ Profile     │ │ Orders             │  │
│                  │  │ Name: David │ │ #123 pending ₪45   │  │
│                  │  │ Tel Aviv    │ │ #121 confirmed     │  │
│                  │  │ Hebrew      │ └────────────────────┘  │
│                  │  └─────────────┘                         │
└──────────────────┴──────────────────────────────────────────┘
```

**Acceptance Criteria:**
- Fetches from `/admin/{tenant}/conversations/{id}`
- Messages displayed in chat bubble style (user left, agent right)
- RTL support for Hebrew messages
- Customer profile card shows: name, address, language, notes
- Customer orders list shows: order ID, status, total
- Clicking order navigates to order detail
- Back button returns to list (preserving selection)

**Dependencies:** Milestone 4

---

## Milestone 6: Orders Table Page

**Goal:** Filterable table of all orders

**Files to create/modify:**
```
admin-ui/src/
├── app/[tenant]/orders/
│   ├── page.tsx                    # Orders list page
│   └── [id]/
│       └── page.tsx                # Order detail page
├── components/
│   ├── OrdersTable.tsx             # Table component
│   └── OrderFilters.tsx            # Filter dropdowns
```

**UI Spec:**
```
┌─────────────────────────────────────────────────────────────┐
│  Valdman                    [Conversations] [Orders]        │
├─────────────────────────────────────────────────────────────┤
│  Filters: [All Statuses ▼] [All Customers ▼]                │
├─────────────────────────────────────────────────────────────┤
│  #124 │ David   │ 2kg ground beef, 1kg...│ pending  │ ₪89  │
│  #123 │ Moshe   │ 1kg pastrami           │ confirmed│ ₪65  │
│  #122 │ Sarah   │ 3kg sausage            │ cancelled│ ₪120 │
└─────────────────────────────────────────────────────────────┘

Order Detail (click row):
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Orders                                           │
├─────────────────────────────────────────────────────────────┤
│  Order #124                              Status: pending    │
│  Customer: David                                            │
│  Created: Jan 25, 2025 at 14:32                            │
│                                                             │
│  Items:                                                     │
│  • 2 kg Ground Beef @ ₪35/kg = ₪70                         │
│  • 1 kg Merguez Sausage @ ₪42/kg = ₪42                     │
│                                          Total: ₪112        │
│                                                             │
│  Delivery Notes: לצלצל בדלת                                 │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- Fetches from `/admin/{tenant}/orders`
- Table columns: ID, Customer, Items (truncated), Status, Total, Date
- Status filter dropdown (All, pending, confirmed, cancelled)
- Customer filter dropdown (populated from data)
- Clicking row opens order detail
- Order detail shows full item breakdown with prices
- RTL support for Hebrew delivery notes

**Dependencies:** Milestones 2, 3

---

## Milestone 7: Polish

**Goal:** Production-quality UX with loading, empty, and error states

**Files to modify:**
```
admin-ui/src/
├── components/
│   ├── LoadingSpinner.tsx          # NEW
│   ├── EmptyState.tsx              # NEW
│   ├── ErrorState.tsx              # NEW
│   └── (all existing components)   # Add loading/error handling
└── app/
    └── (all pages)                 # Add Suspense boundaries
```

**States to handle:**

| State | UI |
|-------|-----|
| Loading conversations | Skeleton list |
| Loading messages | Spinner in detail pane |
| No conversations | "No conversations yet" with illustration |
| No orders | "No orders yet" |
| API error | "Failed to load. Retry?" with button |
| Empty filters | "No orders match filters" |

**Acceptance Criteria:**
- Every data fetch shows loading state
- Every empty state has helpful message
- API errors show retry button
- No console errors
- Smooth transitions between states

**Dependencies:** Milestones 4, 5, 6

---

## Summary

| # | Milestone | Est. Effort | Dependencies |
|---|-----------|-------------|--------------|
| 1 | Admin API - Conversations | Small | None |
| 2 | Admin API - Orders & Customers | Small | M1 |
| 3 | Next.js Scaffold | Small | None |
| 4 | Conversations List | Medium | M1, M3 |
| 5 | Conversation Detail | Medium | M4 |
| 6 | Orders Table | Medium | M2, M3 |
| 7 | Polish | Small | M4, M5, M6 |

**Parallel work possible:**
- M1 + M3 can be done in parallel
- M4 + M6 can be done in parallel (after their dependencies)

---

## Testing Strategy

**API Testing (Milestones 1-2):**
- Use curl commands in acceptance criteria
- Verify with real data from agent CLI conversations

**UI Testing (Milestones 4-7):**
- Manual testing in browser
- Test with both tenants (valdman, joannas-bakery)
- Test RTL rendering with Hebrew text
- Test empty states by filtering to no results

**E2E Verification:**
1. Run agent CLI to create conversations/orders
2. View them in Admin Dashboard
3. Verify data matches
