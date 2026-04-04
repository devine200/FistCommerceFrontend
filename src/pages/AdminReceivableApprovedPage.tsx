import { Link, Navigate, useParams } from 'react-router-dom'

import { getReceivableDetailById } from '@/components/dashboard/merchant/receivables/receivableDetailConfig'
import approvedIllustration from '@/assets/admin-receivable-approved.png'

const AdminReceivableApprovedPage = () => {
  const { receivableId } = useParams<{ receivableId: string }>()
  const detail = receivableId ? getReceivableDetailById(receivableId) : null

  if (!receivableId || !detail) {
    return <Navigate to="/dashboard/admin/receivables" replace />
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto pb-10">
      <div className="min-h-[520px] flex items-center justify-center">
        <div className="w-full max-w-[860px]">
          <section className="rounded-[10px] border border-[#E6E8EC] bg-white px-6 py-12 sm:px-10 sm:py-14 flex flex-col items-center text-center">
            <div className="h-[70px] w-[70px] flex items-center justify-center">
              <img src={approvedIllustration} alt="" className="h-[70px] w-[70px] object-contain" draggable={false} />
            </div>

            <h1 className="mt-6 text-[#0B1220] font-bold text-[22px] leading-tight">Receivable Has Been Approved</h1>
            <p className="mt-2 max-w-[560px] text-[#6B7488] text-[12px] leading-relaxed">
              All checks completed. This receivable is approved and listed for funding.
            </p>
          </section>

          <section className="mt-6 rounded-[10px] border border-[#E6E8EC] bg-white p-4 sm:p-5">
            <Link
              to="/dashboard/admin/overview"
              className="h-[46px] rounded-[4px] bg-[#195EBC] text-white text-[15px] font-medium inline-flex items-center justify-center hover:bg-[#154a9a] transition-colors w-full"
            >
              Back to Dashboard
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}

export default AdminReceivableApprovedPage

