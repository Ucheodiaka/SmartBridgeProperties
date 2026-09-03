import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Send,
  ImagePlus,
  Trash2,
  Star,
  Link as LinkIcon,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import { PropertyType, ListingType, PropertySubmission, OwnerAccount } from '../types';
import { supabaseDb } from '../lib/supabase';

interface ListPropertyModalProps {
  onClose: () => void;
  onSubmitSuccess: (data: PropertySubmission) => void;
  currentOwner?: OwnerAccount | null;
}

interface UploadedMediaItem {
  id: string;
  name: string;
  size: string;
  previewUrl: string;
  storagePath?: string;
  type: 'image';
  uploadStatus: 'uploading' | 'uploaded' | 'failed';
  error?: string;
}

// Validate that optional video tour link is a secure HTTPS link from YouTube, Vimeo, or Matterport
const validateVideoTourUrl = (url: string): { isValid: boolean; error?: string } => {
  const trimmed = url.trim();
  if (!trimmed) return { isValid: true };

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return { isValid: false, error: 'Video tour link must begin with https://' };
    }
    const hostname = parsed.hostname.toLowerCase();
    const isYouTube =
      hostname === 'youtube.com' ||
      hostname === 'www.youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'youtu.be' ||
      hostname.endsWith('.youtube.com');
    const isVimeo =
      hostname === 'vimeo.com' ||
      hostname === 'www.vimeo.com' ||
      hostname === 'player.vimeo.com' ||
      hostname.endsWith('.vimeo.com');
    const isMatterport =
      hostname === 'matterport.com' ||
      hostname === 'my.matterport.com' ||
      hostname.endsWith('.matterport.com');

    if (!isYouTube && !isVimeo && !isMatterport) {
      return {
        isValid: false,
        error: 'Video tour link must be from YouTube, Vimeo, or Matterport.',
      };
    }
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid HTTPS URL (e.g. https://www.youtube.com/watch?v=...).',
    };
  }
};

export const ListPropertyModal: React.FC<ListPropertyModalProps> = ({
  onClose,
  onSubmitSuccess,
  currentOwner,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    propertyType: 'Duplex' as PropertyType,
    listingType: 'sale' as ListingType,
    location: 'GRA Phase 2',
    address: '',
    price: '',
    bedrooms: '4',
    bathrooms: '4',
    ownerName: currentOwner?.name || '',
    ownerPhone: currentOwner?.phone || '',
    ownerEmail: currentOwner?.email || '',
    titleDocType: 'Certificate of Occupancy (C of O)',
    description: '',
  });

  // Media state: Images and optional Video tour URL
  const [uploadedImages, setUploadedImages] = useState<UploadedMediaItem[]>([]);
  const [videoUrlInput, setVideoUrlInput] = useState('');

  // Status and feedback states
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Drag-and-drop state
  const [isDraggingImages, setIsDraggingImages] = useState(false);

  // Hidden File input ref
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Keep track of active object URLs for cleanup
  const previewUrlsRef = useRef<Set<string>>(new Set());

  // Clean up temporary preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore cleanup errors
        }
      });
      previewUrlsRef.current.clear();
    };
  }, []);

  // Format bytes helper
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Image upload processor
  const processImageFiles = async (files: FileList | File[]) => {
    setUploadError(null);
    setSubmissionError(null);
    const fileArray = Array.from(files);

    if (!currentOwner?.id) {
      setUploadError('Please sign in to your Property Lister account before submitting a property.');
      return;
    }

    const validFiles = fileArray.filter((file) => {
      if (!file.type.startsWith('image/')) {
        setUploadError(`"${file.name}" is not a supported image file.`);
        return false;
      }
      if (file.size > 15 * 1024 * 1024) {
        setUploadError(`"${file.name}" exceeds the 15MB file limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);

    for (const file of validFiles) {
      const itemId = `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const objectUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(objectUrl);

      const newItem: UploadedMediaItem = {
        id: itemId,
        name: file.name,
        size: formatFileSize(file.size),
        previewUrl: objectUrl,
        type: 'image',
        uploadStatus: 'uploading',
      };

      setUploadedImages((prev) => [...prev, newItem]);

      try {
        const storagePath = await supabaseDb.uploadSubmissionImage(file, currentOwner.id);
        if (storagePath) {
          setUploadedImages((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? { ...item, uploadStatus: 'uploaded', storagePath }
                : item
            )
          );
        } else {
          setUploadedImages((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    uploadStatus: 'failed',
                    error: 'Upload failed. Please try again.',
                  }
                : item
            )
          );
        }
      } catch (err: any) {
        setUploadedImages((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  uploadStatus: 'failed',
                  error: err?.message || 'Upload failed. Please try again.',
                }
              : item
          )
        );
      }
    }

    setIsUploading(false);
  };

  // Remove individual images with object URL cleanup
  const handleRemoveImage = (id: string) => {
    setUploadedImages((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item?.previewUrl) {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {
          // ignore
        }
        previewUrlsRef.current.delete(item.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleSetCover = (index: number) => {
    setUploadedImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  // Asynchronous submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!currentOwner?.id) {
      setSubmissionError('Please sign in to your Property Lister account before submitting a property.');
      return;
    }

    // Submit only permanent storage paths from successfully uploaded images
    const finalImages = uploadedImages
      .filter((image) => image.uploadStatus === 'uploaded' && image.storagePath)
      .map((image) => image.storagePath as string);

    if (finalImages.length === 0) {
      setSubmissionError('Please upload at least one property photograph before submitting.');
      return;
    }

    if (videoUrlInput.trim()) {
      const videoValidation = validateVideoTourUrl(videoUrlInput);
      if (!videoValidation.isValid) {
        setSubmissionError(videoValidation.error || 'Invalid video tour URL.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const cleanPrice = formData.price.replace(/[^0-9.]/g, '');
      const submissionPayload: PropertySubmission = {
        ...formData,
        price: cleanPrice ? Number(cleanPrice) : 0,
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        ownerId: currentOwner.id,
        ownerName: currentOwner.name || formData.ownerName,
        ownerEmail: currentOwner.email || formData.ownerEmail,
        ownerPhone: currentOwner.phone || formData.ownerPhone,
        status: 'pending',
        images: finalImages,
        videoUrl: videoUrlInput.trim() || undefined,
      };

      const saved = await supabaseDb.saveSubmission(submissionPayload);

      if (saved === true) {
        setSubmitted(true);
        onSubmitSuccess(submissionPayload);
      } else {
        setSubmissionError('Your property could not be submitted. Please check your connection and try again.');
      }
    } catch {
      setSubmissionError('Your property could not be submitted. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // State checks for Submit button disabling
  const isImageUploading = isUploading || uploadedImages.some((img) => img.uploadStatus === 'uploading');
  const hasFailedImages = uploadedImages.some((img) => img.uploadStatus === 'failed');
  const hasUploadedImages = uploadedImages.some(
    (img) => img.uploadStatus === 'uploaded' && Boolean(img.storagePath)
  );
  const hasAuthenticatedOwner = Boolean(currentOwner?.id);
  const hasInvalidVideoUrl = Boolean(videoUrlInput.trim() && !validateVideoTourUrl(videoUrlInput).isValid);

  const isSubmitDisabled =
    isSubmitting ||
    isImageUploading ||
    hasFailedImages ||
    !hasUploadedImages ||
    !hasAuthenticatedOwner ||
    hasInvalidVideoUrl;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="bg-[#FCF9F2] w-full max-w-3xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/40 flex flex-col max-h-[95vh] sm:max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-[#fbf9f8]/95 backdrop-blur-md px-4 sm:px-6 py-4 sm:py-5 border-b border-[#bfc9c3]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#003527] text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5 text-[#fed65b]" />
            </div>
            <div>
              <h2 className="font-playfair text-lg sm:text-xl md:text-2xl font-bold text-[#003527]">
                List Your Property
              </h2>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#707974] block">
                The Port Harcourt Standard Direct Registry
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg bg-[#003527] text-white hover:bg-[#064e3b] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8">
          {submitted ? (
            <div className="text-center py-12 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-[#003527] text-[#fed65b] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-[#003527]">
                Submission Received
              </h3>
              <p className="text-sm text-[#404944] max-w-md mx-auto leading-relaxed">
                Your property submission has been received and is awaiting review. SmartBridge Properties will contact you if additional information is required.
              </p>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="bg-[#003527] text-white font-semibold px-6 py-3 rounded-lg text-sm cursor-pointer hover:bg-[#064e3b] transition-colors"
                >
                  Return to Marketplace
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Lister Sign-In Requirement Notice if missing */}
              {!currentOwner?.id && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-xs text-amber-900">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Authentication Required</p>
                    <p className="mt-0.5">Please sign in to your Property Lister account before submitting a property.</p>
                  </div>
                </div>
              )}

              {/* Review Promise Banner */}
              <div className="bg-[#003527]/10 p-4 rounded-xl flex items-start gap-3 border border-[#003527]/20">
                <ShieldCheck className="w-5 h-5 text-[#003527] shrink-0 mt-0.5" />
                <p className="text-xs text-[#003527] leading-relaxed">
                  Your property information and photographs will be reviewed by SmartBridge Properties before publication. Additional verification may be requested where necessary.
                </p>
              </div>

              {/* Submission Error Banner */}
              {submissionError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{submissionError}</span>
                </div>
              )}

              {/* SECTION 1: PROPERTY PARTICULARS */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#707974] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#003527]" />
                  1. Property Particulars
                </h4>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                    Property Title / Headline *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Contemporary 5-Bed Detached Duplex with Swimming Pool"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c] focus:border-[#003527] focus:ring-1 focus:ring-[#003527]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                      Listing Purpose
                    </label>
                    <select
                      value={formData.listingType}
                      onChange={(e) =>
                        setFormData({ ...formData, listingType: e.target.value as ListingType })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c]"
                    >
                      <option value="sale">For Sale (Direct Purchase)</option>
                      <option value="rent">For Rent (Annual Lease)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                      Property Category
                    </label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) =>
                        setFormData({ ...formData, propertyType: e.target.value as PropertyType })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c]"
                    >
                      <option value="Duplex">Duplex</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Terrace">Terrace</option>
                      <option value="Penthouse">Penthouse</option>
                      <option value="Mansion">Mansion</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                      Neighborhood in Port Harcourt *
                    </label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c]"
                    >
                      <option value="GRA Phase 2">GRA Phase 2</option>
                      <option value="Peter Odili Road">Peter Odili Road</option>
                      <option value="Woji">Woji</option>
                      <option value="Old GRA">Old GRA</option>
                      <option value="Golf Estate">Golf Estate</option>
                      <option value="Ada George">Ada George</option>
                      <option value="Trans Amadi">Trans Amadi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                      Asking Price (₦) *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 150,000,000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c] focus:border-[#003527]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                    Full Property Address / Landmark *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Plot / Street number, near landmark..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c] focus:border-[#003527]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                    Title Document Available
                  </label>
                  <select
                    value={formData.titleDocType}
                    onChange={(e) => setFormData({ ...formData, titleDocType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c]"
                  >
                    <option value="Certificate of Occupancy (C of O)">
                      Certificate of Occupancy (C of O)
                    </option>
                    <option value="Governor's Consent">Governor's Consent</option>
                    <option value="Registered Deed of Conveyance">
                      Registered Deed of Conveyance
                    </option>
                    <option value="Gazette / Family Title">Gazette / Family Title</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                    Description / Key Features
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Highlight special details: swimming pool, solar power installation, security estate, boys quarters..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c] focus:border-[#003527]"
                  />
                </div>
              </div>

              {/* SECTION 2: PHOTOS & OPTIONAL VIDEO TOUR */}
              <div className="space-y-5 pt-4 border-t border-[#bfc9c3]/30">
                <div>
                  <h4 className="text-xs font-bold text-[#707974] uppercase tracking-wider flex items-center gap-1.5">
                    <ImagePlus className="w-3.5 h-3.5 text-[#003527]" />
                    2. Upload Property Photographs & Video Tour Link
                  </h4>
                  <p className="text-[11px] text-[#404944] mt-0.5">
                    Upload original property photographs and optionally attach a video walkthrough link.
                  </p>
                </div>

                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* --- A. PHOTOS DROPZONE --- */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1b1c1c] uppercase flex items-center gap-1.5">
                      <span>Property Photos *</span>
                      <span className="text-[10px] font-normal text-[#707974]">
                        (PNG, JPG, WEBP • Max 15MB per photo)
                      </span>
                    </label>
                    <span className="text-xs font-bold text-[#003527]">
                      {uploadedImages.length} Photo{uploadedImages.length === 1 ? '' : 's'} Selected
                    </span>
                  </div>

                  {/* Hidden Input for Images */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        processImageFiles(e.target.files);
                      }
                    }}
                  />

                  {/* Drag-and-drop box for images */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingImages(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDraggingImages(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingImages(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        processImageFiles(e.dataTransfer.files);
                      }
                    }}
                    onClick={() => imageInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      isDraggingImages
                        ? 'border-[#003527] bg-[#003527]/10 scale-[1.01]'
                        : 'border-[#bfc9c3] bg-white hover:bg-[#fbf9f8] hover:border-[#003527]/60'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-[#003527]/10 text-[#003527] flex items-center justify-center mx-auto mb-2">
                      <ImagePlus className="w-5 h-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#1b1c1c]">
                      Drag & drop property photos here, or{' '}
                      <span className="text-[#003527] underline">browse files</span>
                    </p>
                    <p className="text-[11px] text-[#707974] mt-1">
                      Upload exterior facade, living spaces, bedrooms, kitchen, and premises (up to 15MB each).
                    </p>
                  </div>

                  {/* Photo Preview Grid */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={img.id}
                          className={`group relative rounded-xl overflow-hidden border bg-white shadow-xs aspect-[4/3] flex flex-col justify-between ${
                            img.uploadStatus === 'failed'
                              ? 'border-red-400 bg-red-50/50'
                              : 'border-[#bfc9c3]/50'
                          }`}
                        >
                          <img
                            src={img.previewUrl}
                            alt={img.name}
                            className={`w-full h-full object-cover ${
                              img.uploadStatus === 'uploading' ? 'opacity-50' : ''
                            }`}
                          />

                          {/* Uploading Status Overlay */}
                          {img.uploadStatus === 'uploading' && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1.5 p-2 text-white">
                              <Loader2 className="w-5 h-5 animate-spin text-[#fed65b]" />
                              <span className="text-[10px] font-medium tracking-wide">
                                Uploading to storage...
                              </span>
                            </div>
                          )}

                          {/* Failed Status Overlay with Visible Error */}
                          {img.uploadStatus === 'failed' && (
                            <div className="absolute inset-0 bg-red-950/80 p-2 flex flex-col justify-between text-white">
                              <div className="flex items-center justify-between">
                                <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Failed
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(img.id);
                                  }}
                                  className="w-6 h-6 rounded-full bg-white text-red-600 hover:bg-red-50 flex items-center justify-center shadow-xs cursor-pointer"
                                  title="Remove failed photo"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-[10px] text-red-100 font-medium leading-tight">
                                {img.error || 'Upload failed. Please remove or retry.'}
                              </p>
                            </div>
                          )}

                          {/* Normal Hover Overlay Controls */}
                          {img.uploadStatus !== 'failed' && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                              <div className="flex items-center justify-between">
                                {img.uploadStatus === 'uploaded' && (
                                  idx === 0 ? (
                                    <span className="bg-[#fed65b] text-[#745c00] text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1 shadow-xs">
                                      <Star className="w-2.5 h-2.5 fill-current" /> Cover Photo
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetCover(idx);
                                      }}
                                      className="bg-white/90 hover:bg-white text-[#003527] text-[9px] font-bold px-1.5 py-0.5 rounded-sm shadow-xs cursor-pointer"
                                    >
                                      Set as Cover
                                    </button>
                                  )
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(img.id);
                                  }}
                                  className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xs cursor-pointer ml-auto"
                                  title="Remove photo"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="text-[10px] text-white font-medium truncate block bg-black/60 px-1.5 py-0.5 rounded-xs">
                                {img.name} ({img.size})
                              </span>
                            </div>
                          )}

                          {/* Top indicator badge when not hovering */}
                          {idx === 0 && img.uploadStatus === 'uploaded' && (
                            <span className="absolute top-1.5 left-1.5 bg-[#003527] text-[#fed65b] text-[9px] font-bold px-1.5 py-0.5 rounded-sm shadow-xs group-hover:hidden">
                              Cover Photo
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* --- B. OPTIONAL VIDEO TOUR LINK --- */}
                <div className="space-y-2 pt-3 border-t border-[#bfc9c3]/30">
                  <label className="block text-xs font-bold text-[#1b1c1c] uppercase flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-[#003527]" />
                    <span>Optional Video Tour Link</span>
                    <span className="text-[10px] font-normal text-[#707974]">
                      (YouTube, Vimeo, or Matterport)
                    </span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/... or Matterport link"
                    value={videoUrlInput}
                    onChange={(e) => {
                      setVideoUrlInput(e.target.value);
                      setSubmissionError(null);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-xs text-[#1b1c1c] focus:outline-none ${
                      videoUrlInput.trim() && !validateVideoTourUrl(videoUrlInput).isValid
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#bfc9c3] focus:border-[#003527]'
                    }`}
                  />
                  {videoUrlInput.trim() && !validateVideoTourUrl(videoUrlInput).isValid && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {validateVideoTourUrl(videoUrlInput).error}
                    </p>
                  )}
                  <p className="text-[10px] text-[#707974]">
                    Provide an optional HTTPS link to a walkthrough video hosted on YouTube, Vimeo, or a 3D virtual tour on Matterport.
                  </p>
                </div>
              </div>

              {/* SECTION 3: OWNER / DEVELOPER CONTACT */}
              <div className="space-y-4 pt-4 border-t border-[#bfc9c3]/30">
                <h4 className="text-xs font-bold text-[#707974] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#003527]" />
                  3. Owner / Developer Verification Contact
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                      Full Legal Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Chief Boma Briggs"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                      Phone Number (WhatsApp Active) *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+234 803 000 0000"
                      value={formData.ownerPhone}
                      onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="boma.briggs@domain.com"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c]"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-[#bfc9c3]/30">
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={`w-full font-semibold text-sm py-4 rounded-[10px] transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isSubmitDisabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-75'
                      : 'bg-[#003527] text-white hover:bg-[#064e3b] cursor-pointer'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 text-[#fed65b] animate-spin" />
                      Submitting Property for Review...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#fed65b]" />
                      Submit Property for Review
                    </>
                  )}
                </button>

                {isSubmitDisabled && !isSubmitting && (
                  <div className="mt-2 text-[11px] text-center text-[#707974]">
                    {!hasAuthenticatedOwner && (
                      <span className="text-amber-700 font-medium">
                        Please sign in to your Property Lister account before submitting a property.
                      </span>
                    )}
                    {hasAuthenticatedOwner && isImageUploading && (
                      <span>Please wait while photographs finish uploading...</span>
                    )}
                    {hasAuthenticatedOwner && !isImageUploading && hasFailedImages && (
                      <span className="text-red-600 font-medium">
                        Please remove failed photo uploads before submitting.
                      </span>
                    )}
                    {hasAuthenticatedOwner && !isImageUploading && !hasFailedImages && !hasUploadedImages && (
                      <span>At least one uploaded property photograph is required.</span>
                    )}
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
