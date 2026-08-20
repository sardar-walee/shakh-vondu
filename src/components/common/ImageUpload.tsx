import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  helperText?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxImages = 5,
  label = 'وێنەکان باربکە',
  helperText = 'دەتوانیت تا چەند وێنەیەک بە کوالیتی بەرز دابنێیت'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    // Read and compress preview
    const newImages: string[] = [];
    let processed = 0;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
        }
        processed++;
        if (processed === files.length) {
          const combined = [...images, ...newImages].slice(0, maxImages);
          onChange(combined);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-sm font-semibold text-slate-700">{label}</label>}

      {/* Grid of uploaded images + Add Button */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((img, index) => (
          <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
            <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 shadow transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-1 right-1 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                سەرەکی
              </span>
            )}
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50/40 text-slate-500 hover:text-orange-600 transition-colors p-2 text-center"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            ) : (
              <>
                <Upload className="w-6 h-6 mb-1.5 text-slate-400" />
                <span className="text-xs font-semibold">زیادکردنی وێنە</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{images.length}/{maxImages}</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
