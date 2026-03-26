import profileBannerImage from '@/assets/8106d090aca351f8208b0cad492afe4e14bb1aa5.jpg'
import profileAvatarImage from '@/assets/Ellipse 5.png'

interface InvestorProfileHeroProps {
  name: string
  email: string
}

const InvestorProfileHero = ({ name, email }: InvestorProfileHeroProps) => {
  return (
    <section className="relative rounded-[10px] border border-[#E6E8EC] bg-white overflow-hidden">
      <div className="relative h-[120px]">
        <img src={profileBannerImage} alt="" className="h-full w-full object-cover" draggable={false} />

        <div className="absolute right-5 top-8 flex items-center gap-2">
          <button
            type="button"
            className="rounded-[10px] bg-[#2A2F3E]/60 text-white text-[22px] leading-tight px-6 py-2.5 backdrop-blur-[2px] font-medium"
          >
            Repay Loan
          </button>
          <button
            type="button"
            className="rounded-[10px] bg-[#2A2F3E]/60 text-white text-[22px] leading-tight px-6 py-2.5 backdrop-blur-[2px] font-medium"
          >
            Withdraw Funds
          </button>
        </div>
      </div>

      <img
        src={profileAvatarImage}
        alt=""
        className="absolute left-8 top-[72px] h-[96px] w-[96px] rounded-full object-cover shadow-sm z-10"
        draggable={false}
      />

      <div className="px-8 pb-6 pt-12">
        <h1 className="ml-[112px] text-[#0B1220] text-[36px] leading-tight font-bold">{name}</h1>
        <p className="ml-[112px] text-[#7B8395] text-[18px] mt-1">{email}</p>
      </div>
    </section>
  )
}

export default InvestorProfileHero
