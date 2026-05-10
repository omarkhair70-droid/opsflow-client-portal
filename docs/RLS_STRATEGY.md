# OpsFlow RLS Strategy

## Implemented Phase 4 RLS

### `quotes`
- Internal active org members can read in-tenant quotes.
- Internal owner/admin/manager can insert/update in-tenant quotes.
- Portal active client members can read only linked-client quotes where status is not `draft`.
- Portal users cannot write quotes.

### `approvals`
- Internal active org members can read in-tenant approvals.
- Portal active client members can read approvals only for their linked client request quotes.
- Portal active client members can insert one approval on published quotes for their linked client and must set `decided_by_user_id = auth.uid()`.
- No update/delete policies are provided for approvals.

### Security guarantees
- No draft quote exposure to portal users.
- No service-role bypasses.
- One approval per quote and only on published quotes.
