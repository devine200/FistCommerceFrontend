# Admin governance (multisig)

Admin actions that mutate protocol state on testnet/prod flow through multisig unless the backend local bypass is enabled.

## State machine

1. **Admin action** (KYC review, withdrawal approve, risk tier) → backend `build_calls()` + simulate → proposal stored (`201`/`202`) or direct tx (`200` local bypass).
2. **Sign** — multisig owners `personal_sign(digestToSign)` from `GET /api/multisig/proposals/{id}/signing-payload/`, then `POST …/sign/`.
3. **Execute** — when threshold met and simulation passes, `POST …/execute/` (servicer relayer submits on-chain).

## Frontend modules

| Path | Role |
|------|------|
| `src/admin/governance/` | Orchestration, outcome UI, signing hook, status badges |
| `src/api/multisig/` | API client + normalization |
| `src/store/slices/adminMultisigSlice.ts` | Queue, detail cache, sign/execute/cancel |
| `src/pages/AdminGovernance*Page.tsx` | Queue + proposal detail |

## Integration surfaces

- **KYC** — `POST /kyc/admin/kyc-review` → `AdminGovernanceOutcomeFlow` (Sign now / Open proposal)
- **Withdrawals** — `POST …/withdrawals/{key}/approve/` → same outcome flow
- **Risk tiers** — `POST /multisig/proposals/risk-tier/` per changed tier
- **Protocol pause** — `POST /multisig/proposals/protocol-pause/` with `{ "paused": true|false }`; read state via `GET /api/multisig/protocol-safety/` — see [protocol-pause-integration.md](./protocol-pause-integration.md)
- **Multisig owners** — Settings → Multisig owners panel; prefer `POST /multisig/proposals/multisig-signer-rotation/` for add/remove/threshold changes. Single-op endpoints: `multisig-add-signers/`, `multisig-remove-signers/`, `multisig-set-threshold/`.

Explicit create endpoints (`withdrawal-approve/`, `kyc-status/`) are available in `proposals.ts` for retry tooling; business APIs are the default path.

## Multisig owner management (Settings)

1. Open **Admin → Settings → Multisig owners**.
2. Review on-chain signers and threshold (`GET /api/multisig/config/`).
3. Use the **rotation wizard** to add/remove owners and optionally change threshold, then **Apply rotation**.
4. Owners sign via governance queue or proposal detail; **Execute** when threshold is met.
5. After execute, if `postExecuteSync.multisigSignerMgmt.backendKeyAlignment` reports misaligned keys, update server `.env` `ADMIN` / `SERVICER` wallet keys to match on-chain owners.

| Endpoint | Body |
|----------|------|
| `POST /api/multisig/proposals/multisig-signer-rotation/` | `{ add_addresses?, remove_addresses?, threshold? }` |
| `POST /api/multisig/proposals/multisig-add-signers/` | `{ addresses: string[] }` |
| `POST /api/multisig/proposals/multisig-remove-signers/` | `{ addresses: string[] }` |
| `POST /api/multisig/proposals/multisig-set-threshold/` | `{ threshold: number }` |

Signer-management proposals always require multisig (no local bypass).

## Rules

- Never build protocol calldata in the browser.
- Never sign except `digestToSign` from the signing-payload endpoint.
- Owners sign off-chain only; execute is always via API (servicer relayer).
