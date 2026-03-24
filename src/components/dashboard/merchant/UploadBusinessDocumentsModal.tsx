import { useRef, useState, type DragEvent } from 'react'

import backArrowIcon from '@/assets/ph_arrow-left.png'
import cloudUploadIcon from '@/assets/cloud-upload.png'

interface UploadBusinessDocumentsModalProps {
  onBack: () => void
  onComplete: () => void
}

const REQUIRED_DOCUMENTS_COPY =
  'Certificate of Incorporation, Government ID of Owner, Recent Bank Statement, Sample Invoice or Purchase Order, and Proof of Business Address.'

const UploadBusinessDocumentsModal = ({ onBack, onComplete }: UploadBusinessDocumentsModalProps) => {
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
      <div className="flex items-start gap-2 mb-2 relative left-[-50px]">
        <button type="button" onClick={onBack} className="w-[50px] h-[40px] flex items-center justify-start relative left-[-20px]">
          <img src={backArrowIcon} alt="back" className="w-[50px] h-[40px] object-contain" />
        </button>
        <div className="flex flex-col gap-3">
          <h2 className="text-black font-bold text-[32px]">Upload Business Documents</h2>
          <p className="text-[#6B7488] text-[20px]">
            Submit the required business documents to complete verification and enable access to financing.
          </p>
          <p className="text-black font-bold text-[20px] leading-snug">{REQUIRED_DOCUMENTS_COPY}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div
          className={`border border-dashed rounded-[10px] bg-[#FAFBFD] ${isDragging ? 'border-[#195EBC]' : 'border-[#C9CFDA]'}`}
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="px-6 py-8 flex flex-col items-center text-center">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#E8EFFB]">
              <img src={cloudUploadIcon} alt="" className="h-[52px] w-[52px] object-contain" aria-hidden />
            </div>

            <p className="mt-4 text-[16px]">
              <button type="button" onClick={openFilePicker} className="text-[#195EBC] font-semibold">
                Click to upload
              </button>{' '}
              <span className="text-[#6B7488]">or drag and drop</span>
            </p>

            <p className="mt-1 text-[12px] text-[#A0A8B8]">SVG, PNG, JPG or GIF (max. 800x400px)</p>
            {selectedFileName && <p className="mt-2 text-[12px] text-[#195EBC]">{selectedFileName}</p>}
          </div>

          <div className="border-t border-[#E3E7EF] px-6 py-4 flex flex-col items-center gap-2">
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

      <button type="button" onClick={onComplete} className="mt-6 bg-[#195EBC] text-white px-5 py-3 rounded-md w-full text-[20px] font-semibold">
        Continue
      </button>
    </div>
  )
}

export default UploadBusinessDocumentsModal
