# Protocol pause — frontend integration

Global protocol pause goes through the **multisig governance pipeline**. The frontend does not build calldata or broadcast txs directly.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/multisig/protocol-safety/` | Read on-chain `ProtocolController` pause flags |
| `POST` | `/api/multisig/proposals/protocol-pause/` | Create a governance proposal for `setPaused(bool)` |
| `POST` | `/api/multisig/proposals/protocol-deposits-pause/` | Create a proposal for deposits pause |
| `POST` | `/api/multisig/proposals/protocol-withdrawals-pause/` | Create a proposal for withdrawals pause |
| `POST` | `/api/multisig/proposals/protocol-funding-pause/` | Create a proposal for funding pause |
| `POST` | `/api/multisig/proposals/protocol-repayments-pause/` | Create a proposal for repayments pause |

**Auth:** `Authorization: Token <admin-token>` (admin session; owner wallet required only for signing).

### Read — current on-chain state

```http
GET /api/multisig/protocol-safety/
```

**Response `200`:**

```json
{
  "paused": false,
  "depositsPaused": false,
  "withdrawalsPaused": false,
  "fundingPaused": false,
  "repaymentsPaused": false
}
```

Global **paused** and granular pause flags (`depositsPaused`, `withdrawalsPaused`, `fundingPaused`, `repaymentsPaused`) are writable via multisig proposals. The settings UI loads all flags from `GET /api/multisig/protocol-safety/` and creates one proposal per changed flag on Apply.

### Write — create pause/unpause proposal

```http
POST /api/multisig/proposals/protocol-pause/
Content-Type: application/json

{ "paused": true }
```

| Status | Meaning | Frontend handling |
|--------|---------|-------------------|
| `201` | New proposal | `parseAdminWriteResponse` → `proposal_created` |
| `202` | Open proposal already exists for same intent | `governance_queued` |
| `200` | Local bypass only (`MULTISIG_BYPASS_LOCAL`) | `completed` + `tx_hash` |
| `4xx` | Validation / simulation failed | Show error message |

Proposal responses include `proposalId` (and on direct create, full proposal detail with `calls`, `status`, etc.).

## API client

```ts
import {
  fetchProtocolSafetyState,
  postMultisigCreateProtocolPauseProposal,
  postMultisigCreateProtocolDepositsPauseProposal,
  postMultisigCreateProtocolWithdrawalsPauseProposal,
  postMultisigCreateProtocolFundingPauseProposal,
  postMultisigCreateProtocolRepaymentsPauseProposal,
} from '@/api/protocolSafety'
```

- `fetchProtocolSafetyState(accessToken)` → `ProtocolSafetyState`
- `postMultisigCreateProtocolPauseProposal(accessToken, paused, { signal? })` → `AdminWriteOutcome`
- Granular helpers follow the same shape: `postMultisigCreateProtocolDepositsPauseProposal`, etc.

## Recommended UI flow

1. **Load** on-chain state on mount (`fetchProtocolSafetyState`).
2. **Compare** user toggle to loaded baseline; skip Apply if unchanged.
3. **Submit** `postMultisigCreateProtocolPauseProposal(token, nextPaused)`.
4. **Normalize** with `submitAdminAction` + `resolveAdminWriteOutcome` (`operationType: 'protocol_pause'`).
5. **Show** `PrivilegedActionFeedbackLayer` / `AdminGovernanceOutcomeFlow`:
   - `proposal_queued` → Sign now / Open proposal (`/dashboard/admin/governance/{proposalId}`)
   - `direct_complete` → show tx link (local bypass only)
6. **Refresh** pause state when the feedback modal is dismissed (and after execute via page revisit). Until execute, on-chain `paused` reflects the **previous** value — the UI must not treat proposal creation as an on-chain state change.

## Reference implementation

| Piece | Location |
|-------|----------|
| Settings UI | `src/components/admin/settings/ProtocolSafetyPanel.tsx` |
| API module | `src/api/protocolSafety.ts` |
| Governance orchestration | `src/admin/governance/` (`submitAdminAction`, `PrivilegedActionFeedbackLayer`) |
| Sign / execute | `useGovernanceSignAndSubmit`, `AdminGovernanceProposalDetailPage` |
| Operation type | `protocol_pause` in `src/api/types/multisig.ts` |

## Rules

- Do **not** encode `ProtocolController.setPaused` in the browser.
- Do **not** sign anything except `digestToSign` from `GET /api/multisig/proposals/{id}/signing-payload/`.
- **Execute** is always `POST /api/multisig/proposals/{id}/execute/` (no wallet tx from UI).
- Confirm before **pause** and **unpause** proposal creation.

## Related docs

- General multisig flow: [admin-governance.md](./admin-governance.md)
- Governance routes: `/dashboard/admin/governance`, `/dashboard/admin/governance/:proposalId`
