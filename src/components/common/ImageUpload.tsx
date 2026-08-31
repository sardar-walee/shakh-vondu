import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
  Plus,
  Link,
  Eye,
  Check
} from 'lucide-react';
import { uploadMediaToFirebaseStorage } from '../../lib/storageService';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  helperText?: string;
  folder?: 'products' | 'cars' | 'avatars' | 'receipts' | 'documents';
}

// Client-side image compression to optimize storage & fast transmission
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxImages = 8,
  label = 'وێنەکان باربکە (تا ٨ وێنە)',
  helperText = 'دەتوانیت تا ٨ وێنەی کوالیتی بەرز دابنێیت. یەکەم وێنە وەک وێنەی سەرەکی دادەنرێت.',
  folder = 'products'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const fileList = Array.from(files);
      const remainingSlots = maxImages - images.length;
      const filesToProcess = fileList.slice(0, remainingSlots);

      const uploadedUrls = await Promise.all(
        filesToProcess.map(async (file) => {
          const compressedDataUrl = await compressImageFile(file);
          const uploadRes = await uploadMediaToFirebaseStorage(compressedDataUrl, folder);
          return uploadRes.url;
        })
      );

      const combined = [...images, ...uploadedUrls].slice(0, maxImages);
      onChange(combined);
    } catch (err) {
      console.error('Failed to compress/upload images:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };


  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInputValue.trim() || images.length >= maxImages) return;
    onChange([...images, urlInputValue.trim()].slice(0, maxImages));
    setUrlInputValue('');
    setShowUrlInput(false);
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const setAsPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    onChange([target, ...rest]);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newArr = [...images];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    onChange(newArr);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        {label && <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">{label}</label>}
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
            {images.length} / {maxImages} وێنە
          </span>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Link className="w-3 h-3" />
            <span>بەستەری وێنە (URL)</span>
          </button>
        </div>
      </div>

      {showUrlInput && (
        <form onSubmit={handleAddUrl} className="flex gap-2 p-2.5 bg-blue-50/70 border border-blue-200 rounded-2xl">
          <input
            type="url"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-latin text-left"
            dir="ltr"
          />
          <button
            type="submit"
            disabled={!urlInputValue.trim()}
            className="px-3 py-1.5 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            زیادکردن
          </button>
        </form>
      )}

      {/* Grid of uploaded images + Add Button */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3">
        {images.map((img, index) => (
          <div
            key={index}
            className={`relative group aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-slate-100 shadow-xs ${
              index === 0 ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />

            {/* Top Action Toolbar on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPreviewImage(img)}
                  className="p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-colors"
                  title="پیشاندانی گەورە"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow"
                  title="سڕینەوەی ئەم وێنەیە"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Reordering & Primary button */}
              <div className="flex items-center justify-between text-[11px] font-bold">
                <div className="flex items-center gap-1">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'left')}
                      className="p-1 bg-white/90 text-slate-800 rounded hover:bg-white"
                      title="بەرەو پێشەوە"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'right')}
                      className="p-1 bg-white/90 text-slate-800 rounded hover:bg-white"
                      title="بەرەو دواوە"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => setAsPrimary(index)}
                    className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-[10px] flex items-center gap-1"
                  >
                    <Star className="w-3 h-3" />
                    <span>سەرەکی</span>
                  </button>
                )}
              </div>
            </div>

            {/* Permanent Badges */}
            {index === 0 && (
              <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                <span>وێنەی سەرەکی</span>
              </span>
            )}

            <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] font-latin font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
              {index + 1}
            </span>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-4/3 sm:aspect-square flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50/40 text-slate-500 hover:text-orange-600 transition-all p-3 text-center cursor-pointer group"
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-1.5">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                <span className="text-[11px] font-bold text-slate-600">بارکردن و کەمکردنەوەی قەبارە...</span>
              </div>
            ) : (
              <>
                <div className="p-2.5 rounded-full bg-slate-100 group-hover:bg-orange-100 text-slate-500 group-hover:text-orange-600 transition-colors mb-1.5">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-orange-600">زیادکردنی وێنە</span>
                <span className="text-[10px] text-slate-400 mt-0.5">کلیک بکە یان فایل هەڵبژێرە</span>
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

      {/* Lightbox / Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden p-2" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-2xl mx-auto" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
