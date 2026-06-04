# TODO - Order Status Management + Delete Order

## Step 1: Repository verification (routes + model)
- Confirm backend routes exist: PATCH /api/orders/:id and DELETE /api/orders/:id.
- Confirm Order model supports statuses: pending, processing, shipped, delivered.

## Step 2: Admin dashboard UI
- Replace static status text with editable dropdown in each order row.
- Implement onchange handler to PATCH /api/orders/:id immediately.
- Ensure status persists after refresh (reload orders from backend).

## Step 3: Dashboard statistics
- Display Total Orders, Pending, Processing, Shipped, Delivered.
- Ensure statistics recompute automatically after status changes and deletions.

## Step 4: Delete order UI
- Add delete button per order.
- Show confirmation popup exactly: "Are you sure you want to delete this order?"
- Call DELETE /api/orders/:id.
- Reload orders and recompute stats after deletion.

## Step 5: Verification checklist
- Pending → Processing → Shipped → Delivered, then refresh.
- Delete an order; ensure it disappears from dashboard + MongoDB and stats update.

