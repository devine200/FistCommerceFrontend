# Admin governance (multisig)

Admin actions that mutate protocol state on testnet/prod flow through multisig unless the backend local bypass is enabled.

## State machine

1. **Admin action** (KYC review, withdrawal approve, risk tier) → backend `build_calls()` + simulate → proposal stored (`201`/`202`) or direct tx (`200` local bypass).
2. **Sign** — multisig owners EIP-712 `signTypedData` the backend `typedData` from `GET /api/multisig/proposals/{id}/signing-payload/` (`UserOpApproval(bytes32 userOpHash)`), then `POST …/sign/`. The frontend requires a complete EIP-712 payload and rejects mismatches against `chainId` / `multisigAddress` / `userOpHashToSign`. Ready when valid owner sigs ≥ threshold.
3. **Execute** — any connected on-chain owner submits `EntryPoint.handleOps` using `GET …/execution-payload/`, then `POST …/confirm-execute/` with the tx hash.

**Do not use `POST …/execute/` from the app.** That servicer-relay endpoint may still exist for Hardhat/ops scripts; the UI path is owner `handleOps` + `confirm-execute` only (`useGovernanceExecuteProposal`).

## Frontend modules

| Path | Role |
|------|------|
| `src/admin/governance/` | Orchestration, outcome UI, sign + execute hooks, status badges |
| `src/api/multisig/` | API client + normalization (strict typedData) |
| `src/store/slices/adminMultisigSlice.ts` | Queue, detail cache, sign submit / cancel |
| `src/pages/AdminGovernance*Page.tsx` | Queue + proposal detail |

Sign entry point: `useGovernanceSignAndSubmit`. Execute entry point: `useGovernanceExecuteProposal`.

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
- Never sign except backend `typedData` from the signing-payload endpoint (EIP-712 `UserOpApproval`). Do not synthesize typed data on the client.
- Owners sign off-chain; execute is submitted from a connected owner wallet via `handleOps` + `confirm-execute`.
- Execute requires the connected wallet to match the admin session wallet when a session wallet is set.
- Deploy this frontend only with a backend that returns EIP-712 `typedData` on signing-payload.

## Manual smoke checklist

1. Admin login on the correct `chainId`.
2. Create proposal → signing-payload includes `typedData`.
3. Owner Sign → wallet shows `UserOpApproval` typed data → sig accepted → Ready.
4. Same/other owner Execute → `handleOps` succeeds → status Executed.
5. Confirm nothing calls `POST …/execute/` in the network tab during Execute.
6. Wrong session wallet → Execute disabled / clear reconnect hint.
