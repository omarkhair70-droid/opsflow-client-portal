# OpsFlow RLS Strategy

## Implemented coverage
RLS is enabled on foundation tables plus `requests` and `activity_events`.

## Requests policies
- Internal active org members can read all requests in their org.
- Active client members can read requests only for their own linked `client_id`.
- Active client members can insert only requests for their own linked `client_id`, with matching `organization_id`, and `submitted_by_user_id = auth.uid()`.
- Internal active org members can update requests in their org.
- No delete policy.

## Activity events policies
- Internal active org members can read organization events.
- No direct user insert/update/delete policies.
- Request events are written by DB trigger path from `requests` inserts/updates.

## Security posture
- Deny-by-default retained.
- No Phase 1 RLS weakening.
- Tenant isolation is enforced by membership predicates in policies.
