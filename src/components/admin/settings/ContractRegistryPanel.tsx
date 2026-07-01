import { DEFAULT_CONTRACT_REGISTRY } from '@/components/admin/settings/protocolSettingsDefaults'
import { ReadOnlyBadge, SettingsPanel, shortAddress } from '@/components/admin/settings/SettingsPanel'

const ContractRegistryPanel = () => {
  return (
    <SettingsPanel
      title="Contract Registry"
      description="Deploy-time wiring and immutable references. These values cannot be changed without redeploying or upgrading contracts."
      badge={{ label: 'Deploy time', variant: 'neutral' }}
    >
      <div className="flex flex-col gap-6">
        {DEFAULT_CONTRACT_REGISTRY.map((group) => (
          <div key={group.contract}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h3 className="text-[#0B1220] text-[15px] font-semibold">{group.contract}</h3>
              <ReadOnlyBadge />
            </div>
            <div className="overflow-x-auto rounded-[8px] border border-[#E6E8EC]">
              <table className="min-w-[480px] w-full text-left text-[14px]">
                <tbody>
                  {group.rows.map((row) => (
                    <tr key={row.label} className="border-t border-[#EEF0F4] first:border-t-0">
                      <th className="px-4 py-3 w-[40%] text-[#6B7488] font-medium align-top">{row.label}</th>
                      <td className="px-4 py-3 font-mono text-[13px] text-[#0B1220] break-all">
                        {row.value.startsWith('0x') ? (
                          <span title={row.value}>{shortAddress(row.value)}</span>
                        ) : (
                          row.value
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </SettingsPanel>
  )
}

export default ContractRegistryPanel
