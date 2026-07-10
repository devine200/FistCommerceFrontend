#!/usr/bin/env bash
# Exercise admin request queue approve/reject endpoints against a running backend.
# Usage: ADMIN_TOKEN=<token> ./scripts/test-admin-request-queue.sh
# Optional: API_BASE=http://localhost:8000/api

set -euo pipefail

API_BASE="${API_BASE:-http://localhost:8000/api}"
TOKEN="${ADMIN_TOKEN:-}"
if [[ -z "$TOKEN" ]]; then
  echo "Set ADMIN_TOKEN to an admin session token." >&2
  exit 1
fi

auth=(-H "Authorization: Token ${TOKEN}" -H "Accept: application/json" -H "Content-Type: application/json")

request() {
  local method="$1" url="$2" body="${3:-}"
  echo ""
  echo ">>> $method $url"
  if [[ -n "$body" ]]; then
    curl -sS --max-time 30 -X "$method" "${auth[@]}" -d "$body" -w "\nHTTP %{http_code}\n" "$url"
  else
    curl -sS --max-time 30 -X "$method" "${auth[@]}" -w "\nHTTP %{http_code}\n" "$url"
  fi
}

LIST_URL="${API_BASE}/metrics/admin/requests/?status=pending&limit=50"
echo "Listing pending requests..."
LIST_JSON="$(curl -sS --max-time 30 "${auth[@]}" "$LIST_URL")"
echo "$LIST_JSON" | python3 -m json.tool 2>/dev/null | head -80 || echo "$LIST_JSON"

python3 <<'PY' "$LIST_JSON"
import json, sys
raw = json.loads(sys.argv[1])
rows = raw.get("results") or raw.get("requests") or raw.get("items") or []
pending = [r for r in rows if str(r.get("status", "")).lower() == "pending"]
disb = next((r for r in pending if str(r.get("type", "")).lower() == "disbursement"), None)
wd = next((r for r in pending if str(r.get("type", "")).lower() == "withdrawal"), None)

def action_key(row, typ):
    return (row.get("requestKey") or row.get("request_key") or "").strip()

if disb:
    key = action_key(disb, "disbursement")
    print(f"DISBURSEMENT_KEY={key}")
    print(f"DISBURSEMENT_ROW_ID={disb.get('id')}")
    print(f"DISBURSEMENT_RECEIVABLE_ID={disb.get('receivable_id') or disb.get('receivableId')}")
else:
    print("DISBURSEMENT_KEY=")

if wd:
    key = action_key(wd, "withdrawal")
    print(f"WITHDRAWAL_KEY={key}")
    print(f"WITHDRAWAL_ROW_ID={wd.get('id')}")
    print(f"WITHDRAWAL_USER={((wd.get('party') or {}).get('wallet') or '')}")
else:
    print("WITHDRAWAL_KEY=")
PY

eval "$(python3 <<'PY' "$LIST_JSON"
import json, sys
raw = json.loads(sys.argv[1])
rows = raw.get("results") or raw.get("requests") or raw.get("items") or []
pending = [r for r in rows if str(r.get("status", "")).lower() == "pending"]

def action_key(row, typ):
    return (row.get("requestKey") or row.get("request_key") or "").strip()

disb = next((r for r in pending if str(r.get("type", "")).lower() == "disbursement"), None)
wd = next((r for r in pending if str(r.get("type", "")).lower() == "withdrawal"), None)
if disb:
    k = action_key(disb, "disbursement").replace("'", "'\\''")
    print(f"export DISBURSEMENT_KEY='{k}'")
if wd:
    k = action_key(wd, "withdrawal").replace("'", "'\\''")
    print(f"export WITHDRAWAL_KEY='{k}'")
    party = wd.get("party") or {}
    u = (party.get("wallet") or "").replace("'", "'\\''")
    print(f"export WITHDRAWAL_USER='{u}'")
PY
)"

echo ""
echo "Dry-run: bogus ids should return 404"
request POST "${API_BASE}/metrics/admin/requests/disbursements/0xdeadbeef/reject/" '{}'
request POST "${API_BASE}/metrics/admin/requests/withdrawals/bogus-request-id/reject/" '{}'

if [[ -n "${DISBURSEMENT_KEY:-}" ]]; then
  echo ""
  echo "Pending disbursement found. Testing REJECT (off-chain) for: $DISBURSEMENT_KEY"
  request POST "${API_BASE}/metrics/admin/requests/disbursements/${DISBURSEMENT_KEY}/reject/" '{}'
else
  echo ""
  echo "No pending disbursement in queue — skip live disbursement reject."
fi

if [[ -n "${WITHDRAWAL_KEY:-}" ]]; then
  echo ""
  echo "Pending withdrawal found. Testing REJECT (off-chain) for: $WITHDRAWAL_KEY"
  request POST "${API_BASE}/metrics/admin/requests/withdrawals/${WITHDRAWAL_KEY}/reject/" '{}'
  echo ""
  echo "To test withdrawal APPROVE (on-chain), run manually:"
  echo "curl -X POST ${auth[*]} -d '{\"user\":\"${WITHDRAWAL_USER:-}\"}' \\"
  echo "  ${API_BASE}/metrics/admin/requests/withdrawals/${WITHDRAWAL_KEY}/approve/"
else
  echo ""
  echo "No pending withdrawal in queue — skip live withdrawal reject/approve."
fi

if [[ -n "${DISBURSEMENT_KEY:-}" ]]; then
  echo ""
  echo "To test disbursement APPROVE (on-chain payout), run manually after funding:"
  echo "curl -X POST ${auth[*]} -d '{}' \\"
  echo "  ${API_BASE}/metrics/admin/requests/disbursements/${DISBURSEMENT_KEY}/approve/"
fi
