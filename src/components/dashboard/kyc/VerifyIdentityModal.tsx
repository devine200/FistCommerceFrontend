import { useRef, useState, type DragEvent } from 'react'

import backArrowIcon from '@/assets/ph_arrow-left.png'
import cloudUploadIcon from '@/assets/cloud-upload.png'

interface VerifyIdentityModalProps {
  onBack: () => void
  onComplete: () => void
}

const VerifyIdentityModal = ({ onBack, onComplete }: VerifyIdentityModalProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (file: File | null) => {
    if (!file) return
    setSelectedFileName(file.name)
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0] ?? null
    handleFileSelect(file)
  }

  return (
    <div className="max-w-[620px] mx-auto">
      <div className="flex items-start gap-3 mb-3">
        <button type="button" onClick={onBack} className="h-[40px] w-[40px] flex items-center justify-center shrink-0">
          <img src={backArrowIcon} alt="back" className="w-[24px] h-[24px] object-contain" />
        </button>
        <div className="flex flex-col">
          <h2 className="text-black font-bold text-[20px] sm:text-[26px]">Verify Your Identity</h2>
          <p className="text-[#6B7488] text-[13px] sm:text-[16px] mt-1">
            Upload a valid government ID and complete a quick face verification to confirm your identity.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <h3 className="text-black font-bold text-[14px] sm:text-[16px]">Upload Your Government ID</h3>
        <p className="text-[#6B7488] text-[13px] sm:text-[16px]">List of all Government IDs Accepted</p>

        <div
          className={`border border-dashed rounded-[10px] bg-[#FAFBFD] ${isDragging ? 'border-[#195EBC]' : 'border-[#C9CFDA]'}`}
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center text-center">
            <img src={cloudUploadIcon} alt="cloud upload" className="w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] object-contain" />

            <p className="mt-3 text-[16px]">
              <button type="button" onClick={openFilePicker} className="text-[#195EBC] font-semibold">
                Click to upload
              </button>{' '}
              <span className="text-[#6B7488]">or drag and drop</span>
            </p>

            <p className="mt-1 text-[12px] text-[#A0A8B8]">SVG, PNG, JPG or GIF (max. 800x400px)</p>
            {selectedFileName && <p className="mt-2 text-[12px] text-[#195EBC]">{selectedFileName}</p>}
          </div>

          <div className="border-t border-[#E3E7EF] px-4 sm:px-6 py-4 flex flex-col items-center gap-2">
            <span className="text-[#A0A8B8] text-[12px]">OR</span>
            <button type="button" onClick={openFilePicker} className="bg-[#195EBC] text-white px-5 py-2 rounded-md text-[14px]">
              Browse Files
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,.png,.jpg,.jpeg,.gif,image/svg+xml,image/png,image/jpeg,image/gif"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
      />

      <button type="button" onClick={onComplete} className="mt-6 bg-[#195EBC] text-white px-5 py-3 rounded-md w-full text-[15px] sm:text-[16px] font-semibold">
        Take Photo
      </button>
    </div>
  )
}

export default VerifyIdentityModal
