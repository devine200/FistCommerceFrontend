interface AdminSectionPlaceholderPageProps {
  title: string
}

const AdminSectionPlaceholderPage = ({ title }: AdminSectionPlaceholderPageProps) => {
  return (
    <div className="max-w-[1280px] mx-auto pb-10">
      <h1 className="text-[#0B1220] font-bold text-[22px]">{title}</h1>
      <p className="text-[#6B7488] text-[14px] mt-2">This admin section is coming soon.</p>
    </div>
  )
}

export default AdminSectionPlaceholderPage
