import { DEFAULT_PROTOCOL_CONSTANTS } from '@/components/admin/settings/protocolSettingsDefaults'
import { ReadOnlyBadge, SettingsPanel } from '@/components/admin/settings/SettingsPanel'

const ProtocolConstantsPanel = () => {
  return (
    <SettingsPanel
      title="Protocol Constants"
      description="Hardcoded contract constants with no on-chain setter. Changing these requires a contract upgrade."
      badge={{ label: 'Not configurable', variant: 'neutral' }}
    >
      <div className="overflow-x-auto rounded-[8px] border border-[#E6E8EC]">
        <table className="min-w-[720px] w-full text-left text-[14px]">
          <thead className="bg-[#F8F9FB] text-[#6B7488] text-[12px] font-semibold uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">Constant</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Contract</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {DEFAULT_PROTOCOL_CONSTANTS.map((row) => (
              <tr key={row.label} className="border-t border-[#EEF0F4]">
                <td className="px-4 py-3 font-mono text-[13px] font-medium text-[#0B1220]">{row.label}</td>
                <td className="px-4 py-3 text-[#0B1220]">{row.value}</td>
                <td className="px-4 py-3 text-[#6B7488]">{row.contract}</td>
                <td className="px-4 py-3 text-[#6B7488] text-[13px]">
                  <span className="inline-flex flex-wrap items-center gap-2">
                    {row.note}
                    <ReadOnlyBadge />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsPanel>
  )
}

export default ProtocolConstantsPanel
