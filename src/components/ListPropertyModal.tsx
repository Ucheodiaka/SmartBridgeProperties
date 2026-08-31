import React, { useState, useRef } from 'react';
import {
  X,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Upload,
  Send,
  ImagePlus,
  Video,
  Film,
  Trash2,
  Plus,
  Sparkles,
  Star,
  Play,
  Link as LinkIcon,
  AlertCircle,
  FileText,
  Eye,
} from 'lucide-react';
import { PropertyType, ListingType, PropertySubmission } from '../types';

interface ListPropertyModalProps {
  onClose: () => void;
  onSubmitSuccess: (data: PropertySubmission) => void;
}

interface UploadedMediaItem {
  id: string;
  name: string;
  size: string;
  url: string;
  type: 'image' | 'video';
  isLink?: boolean;
}

const SAMPLE_PH_IMAGES = [
  {
    id: 'sample-img-1',
    name: 'gra_phase2_villa_exterior.webp',
    size: '2.4 MB',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnM3MYULmJ4ZEJl9XEr61oKVlBvSTqv3aqb1s6jID-b8Npnv_qcaRB9ko4FrkCv1DvYqNK1TyE6tdjPD0B4ZS2Gs8O2ZyAM8_YuCNHmV-_o2ax9ggP6AJ1o98KsYr6U4JVPQw4GklZnFyXZLRQVjSjIc8Ze_n3-etnAVPRqsgHJ4tFjqBkm0C2EOAVSYYwWoX6cRJk-evBjH86EWmjefI5olKsClrdgeLRQeVejHh_Z8nhO_EWtHOR',
    type: 'image' as const,
  },
  {
    id: 'sample-img-2',
    name: 'luxury_living_hall.webp',
    size: '1.8 MB',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjrQosth7RHP5almX6ejQjrP7s9Tk8409-bH6taZWnmcCz4KXYefv3XMhSUvXBunHiE7wYxw4m_5BKrz6MCL7zuABKVgmCYeYAzoB3oga9ljul6yPpgfE9I--_n8ESfGy31QrW-mjtRDzKoDYHC9pov0fzyaYLXV-zXP_ZIH-YBK3NNbu8XzFkqUMeq1vTaz_1jsfmyKRu-WKr1_fRG43wPDhqE-ow8SzmCflhPcKhJBpYirHSK_rE',
    type: 'image' as const,
  },
  {
    id: 'sample-img-3',
    name: 'master_ensuite_bedroom.webp',
    size: '2.1 MB',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFXW69395F4iGk_031j-XlE0yv2d9Jj1XQy3Zt3k5h_5a6L7_9b0C1-d8fE3G5h6j7k8m9n0p1q2r3s4t5u6v7w8x9y0z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7a8b9c0d1e2f3g4h5i6j7k8l9m0n1',
    type: 'image' as const,
  },
];

const SAMPLE_PH_VIDEO = {
  id: 'sample-vid-1',
  name: 'smartbridge_property_walkthrough_4k.mp4',
  size: '18.4 MB',
  url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  type: 'video' as const,
};

export const ListPropertyModal: React.FC<ListPropertyModalProps> = ({
  onClose,
  onSubmitSuccess,
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
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    titleDocType: 'Certificate of Occupancy (C of O)',
    description: '',
  });

  // Media state: Images and Videos
  const [uploadedImages, setUploadedImages] = useState<UploadedMediaItem[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<UploadedMediaItem[]>([]);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Drag-and-drop state indicators
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [isDraggingVideos, setIsDraggingVideos] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Hidden File input refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Format bytes helper
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Image upload processor
  const processImageFiles = (files: FileList | File[]) => {
    setUploadError(null);
    const fileArray = Array.from(files);

    const validFiles = fileArray.filter((file) => {
      if (!file.type.startsWith('image/')) {
        setUploadError(`"${file.name}" is not a supported image file.`);
        return false;
      }
      if (file.size > 20 * 1024 * 1024) {
        setUploadError(`"${file.name}" exceeds the 20MB file limit.`);
        return false;
      }
      return true;
    });

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newItem: UploadedMediaItem = {
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            size: formatFileSize(file.size),
            url: e.target.result as string,
            type: 'image',
          };
          setUploadedImages((prev) => [...prev, newItem]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Video upload processor
  const processVideoFiles = (files: FileList | File[]) => {
    setUploadError(null);
    const fileArray = Array.from(files);

    const validFiles = fileArray.filter((file) => {
      if (!file.type.startsWith('video/')) {
        setUploadError(`"${file.name}" is not a supported video file.`);
        return false;
      }
      if (file.size > 100 * 1024 * 1024) {
        setUploadError(`"${file.name}" exceeds the 100MB video limit.`);
        return false;
      }
      return true;
    });

    validFiles.forEach((file) => {
      // Use createObjectURL for high-speed instant video stream preview
      const objectUrl = URL.createObjectURL(file);
      const newItem: UploadedMediaItem = {
        id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: formatFileSize(file.size),
        url: objectUrl,
        type: 'video',
      };
      setUploadedVideos((prev) => [...prev, newItem]);
    });
  };

  // Add external video link
  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    const url = videoUrlInput.trim();
    const newItem: UploadedMediaItem = {
      id: `vid-link-${Date.now()}`,
      name: url.length > 35 ? url.substring(0, 32) + '...' : url,
      size: 'External Stream',
      url: url,
      type: 'video',
      isLink: true,
    };
    setUploadedVideos((prev) => [...prev, newItem]);
    setVideoUrlInput('');
    setShowUrlInput(false);
  };

  // Quick Preset Sample Media
  const handleLoadSampleMedia = () => {
    setUploadedImages(SAMPLE_PH_IMAGES);
    setUploadedVideos([SAMPLE_PH_VIDEO]);
    setUploadError(null);
  };

  // Remove individual items
  const handleRemoveImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleRemoveVideo = (id: string) => {
    setUploadedVideos((prev) => prev.filter((vid) => vid.id !== id));
  };

  const handleSetCover = (index: number) => {
    setUploadedImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Compile media URLs
    const finalImages =
      uploadedImages.length > 0
        ? uploadedImages.map((img) => img.url)
        : [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBnM3MYULmJ4ZEJl9XEr61oKVlBvSTqv3aqb1s6jID-b8Npnv_qcaRB9ko4FrkCv1DvYqNK1TyE6tdjPD0B4ZS2Gs8O2ZyAM8_YuCNHmV-_o2ax9ggP6AJ1o98KsYr6U4JVPQw4GklZnFyXZLRQVjSjIc8Ze_n3-etnAVPRqsgHJ4tFjqBkm0C2EOAVSYYwWoX6cRJk-evBjH86EWmjefI5olKsClrdgeLRQeVejHh_Z8nhO_EWtHOR',
          ];

    const finalVideos = uploadedVideos.map((v) => v.url);

    const submissionPayload: PropertySubmission = {
      ...formData,
      images: finalImages,
      videos: finalVideos,
      videoUrl: finalVideos[0] || undefined,
    };

    setSubmitted(true);
    setTimeout(() => {
      onSubmitSuccess(submissionPayload);
    }, 1200);
  };

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
                Listing Request & Media Received!
              </h3>
              <p className="text-sm text-[#404944] max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.ownerName || 'Valued Partner'}</strong>.
                We have received your listing particulars along with{' '}
                <strong>{uploadedImages.length} photo(s)</strong> and{' '}
                <strong>{uploadedVideos.length} video walkthrough(s)</strong>. A SmartBridge field
                inspection engineer will contact you within 24 hours to schedule the physical audit.
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
              {/* Trust Badge Banner */}
              <div className="bg-[#003527]/10 p-4 rounded-xl flex items-start gap-3 border border-[#003527]/20">
                <ShieldCheck className="w-5 h-5 text-[#003527] shrink-0 mt-0.5" />
                <p className="text-xs text-[#003527] leading-relaxed">
                  <strong>The Port Harcourt Standard:</strong> All properties undergo rigorous
                  in-person structural audit, legal title search at the Ministry of Lands, and flood
                  elevation inspection before publication.
                </p>
              </div>

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

              {/* SECTION 2: PHOTOS & VIDEO UPLOAD (DRAG & DROP + FILE PICKER) */}
              <div className="space-y-5 pt-4 border-t border-[#bfc9c3]/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#707974] uppercase tracking-wider flex items-center gap-1.5">
                      <ImagePlus className="w-3.5 h-3.5 text-[#003527]" />
                      2. Upload Property Photos & Video Walkthrough
                    </h4>
                    <p className="text-[11px] text-[#404944] mt-0.5">
                      Drag and drop your high-resolution photos and video tours, or browse files from
                      your device.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadSampleMedia}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fed65b]/20 hover:bg-[#fed65b]/30 text-[#735c00] text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto border border-[#fed65b]/40 shadow-2xs"
                    title="Populate verified high-res photo gallery & video walkthrough"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#735c00]" />
                    Auto-Fill Sample Media Set
                  </button>
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
                      <span>Property Photos</span>
                      <span className="text-[10px] font-normal text-[#707974]">
                        (PNG, JPG, WEBP • Max 20MB per photo)
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
                      Upload exterior facade, living areas, master ensuite, kitchen, and compound.
                    </p>
                  </div>

                  {/* Photo Preview Grid */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={img.id}
                          className="group relative rounded-xl overflow-hidden border border-[#bfc9c3]/50 bg-white shadow-xs aspect-[4/3] flex flex-col justify-between"
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay Controls */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              {idx === 0 ? (
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
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(img.id);
                                }}
                                className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xs cursor-pointer"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-[10px] text-white font-medium truncate block bg-black/60 px-1.5 py-0.5 rounded-xs">
                              {img.name}
                            </span>
                          </div>

                          {/* Top indicator badge when not hovering */}
                          {idx === 0 && (
                            <span className="absolute top-1.5 left-1.5 bg-[#003527] text-[#fed65b] text-[9px] font-bold px-1.5 py-0.5 rounded-sm shadow-xs group-hover:hidden">
                              Cover Photo
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* --- B. VIDEOS DROPZONE --- */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1b1c1c] uppercase flex items-center gap-1.5">
                      <span>Video Walkthrough / Virtual Tour</span>
                      <span className="text-[10px] font-normal text-[#707974]">
                        (MP4, WEBM, MOV • Max 100MB or Web Link)
                      </span>
                    </label>
                    <span className="text-xs font-bold text-[#003527]">
                      {uploadedVideos.length} Video{uploadedVideos.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {/* Hidden Input for Video */}
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        processVideoFiles(e.target.files);
                      }
                    }}
                  />

                  {/* Drag-and-drop box for videos */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingVideos(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDraggingVideos(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingVideos(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        processVideoFiles(e.dataTransfer.files);
                      }
                    }}
                    onClick={() => videoInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      isDraggingVideos
                        ? 'border-[#003527] bg-[#003527]/10 scale-[1.01]'
                        : 'border-[#bfc9c3] bg-white hover:bg-[#fbf9f8] hover:border-[#003527]/60'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-[#003527]/10 text-[#003527] flex items-center justify-center mx-auto mb-2">
                      <Video className="w-5 h-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#1b1c1c]">
                      Drag & drop a property video walkthrough, or{' '}
                      <span className="text-[#003527] underline">select video file</span>
                    </p>
                    <p className="text-[11px] text-[#707974] mt-1">
                      Full 360° virtual walkthrough, drone aerial tour, or smartphone video recording.
                    </p>
                  </div>

                  {/* External Video Tour Link option */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-[#fbf9f8] p-3 rounded-xl border border-[#bfc9c3]/30">
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-xs font-bold text-[#003527] flex items-center gap-1.5 hover:underline cursor-pointer"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      {showUrlInput ? 'Hide Web Tour Link Input' : '+ Attach YouTube / Vimeo / Cloud Video Tour Link'}
                    </button>
                    <span className="text-[10px] text-[#707974]">Optional online stream</span>
                  </div>

                  {showUrlInput && (
                    <div className="flex gap-2 animate-in fade-in">
                      <input
                        type="url"
                        placeholder="https://youtube.com/watch?v=... or Matterport tour link"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-lg border border-[#bfc9c3] bg-white text-xs text-[#1b1c1c] focus:border-[#003527]"
                      />
                      <button
                        type="button"
                        onClick={handleAddVideoUrl}
                        className="bg-[#003527] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#064e3b] transition-colors cursor-pointer"
                      >
                        Add Link
                      </button>
                    </div>
                  )}

                  {/* Video Previews */}
                  {uploadedVideos.length > 0 && (
                    <div className="space-y-3 pt-1">
                      {uploadedVideos.map((vid) => (
                        <div
                          key={vid.id}
                          className="bg-white rounded-xl border border-[#bfc9c3]/50 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center shrink-0 relative overflow-hidden">
                              <Film className="w-5 h-5 text-[#fed65b]" />
                            </div>
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs font-bold text-[#1b1c1c] truncate max-w-[240px]">
                                  {vid.name}
                                </h5>
                                <span className="bg-[#003527]/10 text-[#003527] text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                                  {vid.isLink ? 'Web Tour' : 'Attached Video'}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#707974] block mt-0.5">
                                {vid.size} • Verified Media Player
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {!vid.isLink && (
                              <div className="relative">
                                <video
                                  src={vid.url}
                                  controls
                                  className="h-14 rounded-lg bg-black object-contain max-w-[140px]"
                                />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveVideo(vid.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Video"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  className="w-full bg-[#003527] text-white font-semibold text-sm py-4 rounded-[10px] hover:bg-[#064e3b] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4 text-[#fed65b]" />
                  Request Physical Inspection & Listing ({uploadedImages.length} Photos, {uploadedVideos.length} Videos)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
