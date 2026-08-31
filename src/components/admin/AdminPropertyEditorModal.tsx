import React, { useState, useEffect } from 'react';
import { X, Upload, ShieldCheck, CheckCircle2, AlertTriangle, Plus, Trash2, Home, MapPin, DollarSign, Image as ImageIcon } from 'lucide-react';
import { Property, PropertyType, ListingType, InspectionReport, AgentInfo } from '../../types';
import { INITIAL_AGENTS } from '../../data/adminData';

interface AdminPropertyEditorModalProps {
  isOpen: boolean;
  property: Property | null; // null means create new
  onClose: () => void;
  onSave: (property: Property) => void;
}

const NEIGHBORHOOD_OPTIONS: Property['neighborhood'][] = [
  'GRA Phase 2',
  'Peter Odili Road',
  'Woji',
  'Old GRA',
  'Ada George',
  'Trans Amadi',
  'Golf Estate',
];

const PROPERTY_TYPES: PropertyType[] = [
  'Apartment',
  'Duplex',
  'Terrace',
  'Penthouse',
  'Mansion',
  'Commercial',
];

const SAMPLE_IMAGE_BANK = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCjrQosth7RHP5almX6ejQjrP7s9Tk8409-bH6taZWnmcCz4KXYefv3XMhSUvXBunHiE7wYxw4m_5BKrz6MCL7zuABKVgmCYeYAzoB3oga9ljul6yPpgfE9I--_n8ESfGy31QrW-mjtRDzKoDYHC9pov0fzyaYLXV-zXP_ZIH-YBK3NNbu8XzFkqUMeq1vTaz_1jsfmyKRu-WKr1_fRG43wPDhqE-ow8SzmCflhPcKhJBpYirHSK_rE',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBnM3MYULmJ4ZEJl9XEr61oKVlBvSTqv3aqb1s6jID-b8Npnv_qcaRB9ko4FrkCv1DvYqNK1TyE6tdjPD0B4ZS2Gs8O2ZyAM8_YuCNHmV-_o2ax9ggP6AJ1o98KsYr6U4JVPQw4GklZnFyXZLRQVjSjIc8Ze_n3-etnAVPRqsgHJ4tFjqBkm0C2EOAVSYYwWoX6cRJk-evBjH86EWmjefI5olKsClrdgeLRQeVejHh_Z8nhO_EWtHOR',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC3CllJyRW6F9UZXL2R57Ps86dwwYwaH5xM-2FUpy6hwmt9dw_lr7Jh9bQao5LAjgVqEVQqvDn2Gy6Ex1NMJrqUw8PNVHr4cWPcH43GIEFIaZtCX2ey-PjjQ-A4H91qLNy_PNHn8qjSb6_NpYo4yZP4YF_xFD5DIsAFnMRQXNo-Cw5tf1TSWswhux3bH2KRS2teorcHxkpvu5ZQimK33956V7SGBC_7XSjeK4h917SDBGSnVBMEoYy7',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCQmtkn82GnwZAnWyDHd2U18rxA4SoWjtQWCnxLTW15tc5S0VQisgHLulQsh7PMmYuCHn_nYjNounS5GLjhz-ldCE_N-28QEV3OSBzerenFaTxHKTC5Dzd-yXhourq2yH_KThq9OE0fb0io7W6tFZgdM-jnQgAK-i_JSdxow6VtzPri8cMvuDr4O3IQ5DErX4UVD8FZSN-SFHZ5dyANKkHNdbcCcmZLsdMf_Nj2i43jFMstdmnoKi6b',
];

export const AdminPropertyEditorModal: React.FC<AdminPropertyEditorModalProps> = ({
  isOpen,
  property,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'inspection' | 'media' | 'features'>('basic');

  // Form State
  const [title, setTitle] = useState('');
  const [listingType, setListingType] = useState<ListingType>('sale');
  const [propertyType, setPropertyType] = useState<PropertyType>('Duplex');
  const [neighborhood, setNeighborhood] = useState<Property['neighborhood']>('GRA Phase 2');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState<number>(100000000);
  const [bedrooms, setBedrooms] = useState<number>(4);
  const [bathrooms, setBathrooms] = useState<number>(4);
  const [parkingSpaces, setParkingSpaces] = useState<number>(3);
  const [sizeSqFt, setSizeSqFt] = useState<number>(3500);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [status, setStatus] = useState<Property['status']>('active');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  // Inspection Report State
  const [overallScore, setOverallScore] = useState<number>(95);
  const [titleDocumentType, setTitleDocumentType] = useState<InspectionReport['titleDocumentType']>('C of O');
  const [titleVerified, setTitleVerified] = useState<boolean>(true);
  const [floodRisk, setFloodRisk] = useState<InspectionReport['floodRisk']>('Zero Risk (Elevated)');
  const [powerGridStability, setPowerGridStability] = useState('Dedicated 33kVA Feeder + Inverter');
  const [securityRating, setSecurityRating] = useState('Grade A+ (Gated Estate Patrol)');
  const [inspectorName, setInspectorName] = useState('Engr. Tamara Briggs, FNSE');
  const [inspectorId, setInspectorId] = useState('SB-INSP-041');
  const [inspectedDate, setInspectedDate] = useState('August 2026');

  // Assigned Agent State
  const [selectedAgentId, setSelectedAgentId] = useState(INITIAL_AGENTS[0].id);

  useEffect(() => {
    if (property) {
      setTitle(property.title);
      setListingType(property.type);
      setPropertyType(property.propertyType);
      setNeighborhood(property.neighborhood);
      setAddress(property.address);
      setPrice(property.price);
      setBedrooms(property.bedrooms);
      setBathrooms(property.bathrooms);
      setParkingSpaces(property.parkingSpaces);
      setSizeSqFt(property.sizeSqFt);
      setIsVerified(property.isVerified);
      setIsFeatured(property.isFeatured);
      setStatus(property.status || 'active');
      setDescription(property.description);
      setImages(property.images.length > 0 ? property.images : [SAMPLE_IMAGE_BANK[0]]);
      setFeatures(property.features || []);
      setAmenities(property.amenities || []);

      if (property.inspectionReport) {
        setOverallScore(property.inspectionReport.overallScore);
        setTitleDocumentType(property.inspectionReport.titleDocumentType);
        setTitleVerified(property.inspectionReport.titleVerified);
        setFloodRisk(property.inspectionReport.floodRisk);
        setPowerGridStability(property.inspectionReport.powerGridStability);
        setSecurityRating(property.inspectionReport.securityRating);
        setInspectorName(property.inspectionReport.inspectorName);
        setInspectorId(property.inspectionReport.inspectorId);
        setInspectedDate(property.inspectionReport.inspectedDate);
      }

      const matchAgent = INITIAL_AGENTS.find((a) => a.name === property.agent?.name);
      if (matchAgent) {
        setSelectedAgentId(matchAgent.id);
      }
    } else {
      // New Property defaults
      setTitle('');
      setListingType('sale');
      setPropertyType('Duplex');
      setNeighborhood('GRA Phase 2');
      setAddress('');
      setPrice(150000000);
      setBedrooms(4);
      setBathrooms(4);
      setParkingSpaces(3);
      setSizeSqFt(3500);
      setIsVerified(true);
      setIsFeatured(false);
      setStatus('active');
      setDescription('Exquisite modern architectural masterpiece located in a prime neighborhood with 24/7 security and certified verification.');
      setImages([SAMPLE_IMAGE_BANK[0], SAMPLE_IMAGE_BANK[1]]);
      setFeatures([
        'All Rooms Ensuite with Water Heaters',
        'Fully Fitted Kitchen with Heat Extractor',
        'Dedicated Solar Inverter System',
        '24/7 Armed Security Patrol',
      ]);
      setAmenities([
        'CCTV Perimeter Surveillance',
        'Industrial Water Filtration Plant',
        'Interlocked Compound & Concrete Paved',
      ]);
      setOverallScore(95);
      setTitleDocumentType('C of O');
      setTitleVerified(true);
      setFloodRisk('Zero Risk (Elevated)');
      setPowerGridStability('Dedicated 33kVA Feeder + Inverter');
      setSecurityRating('Grade A+ (Gated Estate Patrol)');
      setInspectorName('Engr. Tamara Briggs, FNSE');
      setInspectorId('SB-INSP-041');
      setInspectedDate('August 2026');
      setSelectedAgentId(INITIAL_AGENTS[0].id);
    }
  }, [property, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const handleAddImage = (url: string) => {
    if (url && !images.includes(url)) {
      setImages([...images, url]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const formatNairaDisplay = (val: number, type: ListingType) => {
    const formatted = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(val);
    return formatted;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim() || price <= 0) return;

    const assignedAgent = INITIAL_AGENTS.find((a) => a.id === selectedAgentId) || INITIAL_AGENTS[0];

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const savedProp: Property = {
      id: property ? property.id : `prop-${Date.now()}`,
      title: title.trim(),
      slug: slug || 'property-listing',
      location: neighborhood,
      neighborhood: neighborhood,
      address: address.trim(),
      price: Number(price),
      priceDisplay: formatNairaDisplay(Number(price), listingType),
      pricePeriod: listingType === 'rent' ? '/yr' : undefined,
      type: listingType,
      propertyType: propertyType,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      parkingSpaces: Number(parkingSpaces),
      sizeSqFt: Number(sizeSqFt),
      isVerified: isVerified,
      isFeatured: isFeatured,
      status: status,
      images: images.length > 0 ? images : [SAMPLE_IMAGE_BANK[0]],
      description: description.trim(),
      features: features,
      amenities: amenities,
      createdAt: property?.createdAt || new Date().toISOString(),
      inspectionReport: {
        inspectedDate: inspectedDate,
        inspectorName: inspectorName,
        inspectorId: inspectorId,
        overallScore: Number(overallScore),
        titleDocumentType: titleDocumentType,
        titleVerified: titleVerified,
        floodRisk: floodRisk,
        powerGridStability: powerGridStability,
        securityRating: securityRating,
        checklist: property?.inspectionReport?.checklist || [
          { name: 'Certificate of Occupancy & Registry Search', status: 'passed', notes: 'Verified clean at Rivers State Ministry of Lands.' },
          { name: 'Structural Concrete & Load Bearing', status: 'passed', notes: 'Structural engineering audit test passed with zero crack index.' },
          { name: 'Electrical Conduit & Surge Earthing', status: 'passed', notes: 'Copper surge arresters and earthing tests below 4.5 ohms.' },
          { name: 'Topographical Elevation & Storm Drainage', status: 'passed', notes: 'Elevated plot with gravity stormwater drainage channel.' },
        ],
      },
      agent: {
        name: assignedAgent.name,
        role: assignedAgent.role,
        phone: assignedAgent.phone,
        whatsapp: assignedAgent.whatsapp,
        avatar: assignedAgent.avatar,
        badge: assignedAgent.badge,
      },
    };

    onSave(savedProp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in">
      <div
        id="admin-property-editor-modal"
        className="bg-[#FCF9F2] rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-[#bfc9c3]/50 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-[#003527] text-white flex items-center justify-between border-b border-[#003527]/20">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-[#fed65b]/20 flex items-center justify-center text-[#fed65b] shrink-0">
              <Home className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div>
              <h2 className="font-playfair text-base sm:text-xl font-bold line-clamp-1">
                {property ? 'Edit Property Listing' : 'Create New Verified Listing'}
              </h2>
              <p className="text-[10px] sm:text-xs text-[#fed65b]/90 font-medium">
                SmartBridge Port Harcourt Real Estate Registry
              </p>
            </div>
          </div>
          <button
            id="btn-close-property-editor"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#bfc9c3]/40 bg-white/70 px-4 sm:px-6 gap-3 sm:gap-6 text-xs sm:text-sm font-semibold overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 sm:py-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'basic'
                ? 'border-[#003527] text-[#003527] font-bold'
                : 'border-transparent text-[#707974] hover:text-[#003527]'
            }`}
          >
            Basic Details & Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inspection')}
            className={`py-3 sm:py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inspection'
                ? 'border-[#003527] text-[#003527] font-bold'
                : 'border-transparent text-[#707974] hover:text-[#003527]'
            }`}
          >
            <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#735c00]" />
            Inspection Audit & Legal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-3 sm:py-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'media'
                ? 'border-[#003527] text-[#003527] font-bold'
                : 'border-transparent text-[#707974] hover:text-[#003527]'
            }`}
          >
            Images ({images.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`py-3 sm:py-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'features'
                ? 'border-[#003527] text-[#003527] font-bold'
                : 'border-transparent text-[#707974] hover:text-[#003527]'
            }`}
          >
            Features & Amenities
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'basic' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404944] mb-1.5">
                    Property Title *
                  </label>
                  <input
                    id="input-prop-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Contemporary 5-Bed Detached Duplex"
                    className="w-full bg-white border border-[#bfc9c3] rounded-lg px-4 py-2.5 text-sm text-[#1b1c1c] focus:outline-none focus:border-[#003527]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404944] mb-1.5">
                    Listing Status
                  </label>
                  <select
                    id="select-prop-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white border border-[#bfc9c3] rounded-lg px-4 py-2.5 text-sm text-[#1b1c1c] focus:outline-none focus:border-[#003527]"
                  >
                    <option value="active">Active Listing</option>
                    <option value="pending_verification">Pending Audit</option>
                    <option value="sold">Sold Out</option>
                    <option value="rented">Rented Out</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404944] mb-1.5">
                    Listing Type *
                  </label>
                  <div className="flex rounded-lg border border-[#bfc9c3] overflow-hidden bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() => setListingType('sale')}
                      className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        listingType === 'sale' ? 'bg-[#003527] text-white shadow-xs' : 'text-[#404944]'
                      }`}
                    >
                      For Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => setListingType('rent')}
                      className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        listingType === 'rent' ? 'bg-[#003527] text-white shadow-xs' : 'text-[#404944]'
                      }`}
                    >
                      For Rent
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404944] mb-1.5">
                    Property Type *
                  </label>
                  <select
                    id="select-prop-type"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full bg-white border border-[#bfc9c3] rounded-lg px-4 py-2.5 text-sm text-[#1b1c1c] focus:outline-none focus:border-[#003527]"
                  >
                    {PROPERTY_TYPES.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404944] mb-1.5">
                    Neighborhood *
                  </label>
                  <select
                    id="select-prop-neighborhood"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value as any)}
                    className="w-full bg-white border border-[#bfc9c3] rounded-lg px-4 py-2.5 text-sm text-[#1b1c1c] focus:outline-none focus:border-[#003527]"
                  >
                    {NEIGHBORHOOD_OPTIONS.map((nb) => (
                      <option key={nb} value={nb}>
                        {nb}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404944] mb-1.5">
                    Full Physical Address *
                  </label>
                  <input
                    id="input-prop-address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Plot 14, Presidential Section, GRA Phase 2, Port Harcourt"
                    className="w-full bg-white border border-[#bfc9c3] rounded-lg px-4 py-2.5 text-sm text-[#1b1c1c] focus:outline-none focus:border-[#003527]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404944] mb-1.5">
                    Price in Naira (₦) * {listingType === 'rent' ? '(Annual Rent)' : '(Asking Price)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#707974]">₦</span>
                    <input
                      id="input-prop-price"
                      type="number"
                      required
                      min={100000}
                      step={500000}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-white border border-[#bfc9c3] rounded-lg pl-8 pr-4 py-2.5 text-sm text-[#1b1c1c] font-semibold focus:outline-none focus:border-[#003527]"
                    />
                  </div>
                  <p className="text-[11px] text-[#707974] mt-1">
                    Display preview: {formatNairaDisplay(price, listingType)} {listingType === 'rent' ? '/yr' : ''}
                  </p>
                </div>
              </div>

              {/* Specifications: Beds, Baths, Parking, Size */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-[#bfc9c3]/50">
                <div>
                  <label className="block text-xs font-semibold text-[#404944] mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full bg-[#fbf9f8] border border-[#bfc9c3] rounded-lg px-3 py-2 text-sm text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#404944] mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full bg-[#fbf9f8] border border-[#bfc9c3] rounded-lg px-3 py-2 text-sm text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#404944] mb-1">Parking Bays</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={parkingSpaces}
                    onChange={(e) => setParkingSpaces(Number(e.target.value))}
                    className="w-full bg-[#fbf9f8] border border-[#bfc9c3] rounded-lg px-3 py-2 text-sm text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#404944] mb-1">Floor Area (SqFt)</label>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    value={sizeSqFt}
                    onChange={(e) => setSizeSqFt(Number(e.target.value))}
                    className="w-full bg-[#fbf9f8] border border-[#bfc9c3] rounded-lg px-3 py-2 text-sm text-center font-bold"
                  />
                </div>
              </div>

              {/* Badges & Assigned Agent */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/50 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#404944] block">
                    Visibility & Badges
                  </span>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVerified}
                      onChange={(e) => setIsVerified(e.target.checked)}
                      className="w-4 h-4 text-[#003527] rounded-sm focus:ring-[#003527]"
                    />
                    <div>
                      <span className="text-sm font-semibold text-[#1b1c1c] block">SmartBridge Verified</span>
                      <span className="text-xs text-[#707974]">Displays the golden verification badge & audit report</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-[#003527] rounded-sm focus:ring-[#003527]"
                    />
                    <div>
                      <span className="text-sm font-semibold text-[#1b1c1c] block">Featured on Homepage</span>
                      <span className="text-xs text-[#707974]">Promoted in prime spotlight section</span>
                    </div>
                  </label>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/50">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404944] mb-2">
                    Assigned Portfolio Advisor / Agent
                  </label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full bg-[#fbf9f8] border border-[#bfc9c3] rounded-lg px-3.5 py-2.5 text-sm text-[#1b1c1c] font-medium focus:outline-none focus:border-[#003527]"
                  >
                    {INITIAL_AGENTS.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} — {agent.role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#404944] mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an overview of architectural highlights, estate security, finishes, and neighbourhood perks..."
                  className="w-full bg-white border border-[#bfc9c3] rounded-lg p-3.5 text-sm text-[#1b1c1c] focus:outline-none focus:border-[#003527]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: INSPECTION & AUDIT */}
          {activeTab === 'inspection' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-[#003527]/5 border border-[#003527]/20 p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#003527] shrink-0 mt-0.5" />
                <div className="text-xs text-[#404944] leading-relaxed">
                  <strong className="text-[#003527]">Physical Engineering & Land Search Standard:</strong> Every listing published with verification on SmartBridge undergoes on-site engineering testing and Rivers State Ministry of Lands title searches.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/50 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404944]">
                    Overall Inspection Score (0 - 100)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={60}
                      max={100}
                      value={overallScore}
                      onChange={(e) => setOverallScore(Number(e.target.value))}
                      className="flex-1 accent-[#003527]"
                    />
                    <span className="font-playfair text-2xl font-bold text-[#003527] px-3 py-1 bg-[#fed65b]/20 rounded-lg">
                      {overallScore}%
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/50 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404944]">
                    Title Document Type & Verification
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={titleDocumentType}
                      onChange={(e) => setTitleDocumentType(e.target.value as any)}
                      className="bg-[#fbf9f8] border border-[#bfc9c3] rounded-lg px-3 py-2 text-xs font-semibold"
                    >
                      <option value="C of O">Certificate of Occupancy (C of O)</option>
                      <option value="Governor's Consent">Governor's Consent</option>
                      <option value="Deed of Conveyance">Deed of Conveyance</option>
                      <option value="Gazette">Gazette</option>
                    </select>
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#003527] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={titleVerified}
                        onChange={(e) => setTitleVerified(e.target.checked)}
                        className="w-4 h-4 text-[#003527] rounded-sm"
                      />
                      Lands Registry Verified
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/50">
                  <label className="block text-xs font-bold text-[#404944] mb-1">Flood Risk Rating</label>
                  <select
                    value={floodRisk}
                    onChange={(e) => setFloodRisk(e.target.value as any)}
                    className="w-full bg-[#fbf9f8] border border-[#bfc9c3] rounded-lg p-2 text-xs font-semibold"
                  >
                    <option value="Zero Risk (Elevated)">Zero Risk (Elevated)</option>
                    <option value="Low">Low Risk</option>
                    <option value="Moderate">Moderate</option>
                  </select>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/50">
                  <label className="block text-xs font-bold text-[#404944] mb-1">Power Grid Stability</label>
                  <input
                    type="text"
                    value={powerGridStability}
                    onChange={(e) => setPowerGridStability(e.target.value)}
                    placeholder="e.g. 24/7 Dual Gen + Solar"
                    className="w-full bg-[#fbf9f8] border border-[#bfc9c3] rounded-lg p-2 text-xs font-semibold"
                  />
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/50">
                  <label className="block text-xs font-bold text-[#404944] mb-1">Security Rating</label>
                  <input
                    type="text"
                    value={securityRating}
                    onChange={(e) => setSecurityRating(e.target.value)}
                    placeholder="e.g. Grade A+ (Armed Patrol)"
                    className="w-full bg-[#fbf9f8] border border-[#bfc9c3] rounded-lg p-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#404944] mb-1">Lead Inspector Name</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full bg-white border border-[#bfc9c3] rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#404944] mb-1">Inspector ID Badge</label>
                  <input
                    type="text"
                    value={inspectorId}
                    onChange={(e) => setInspectorId(e.target.value)}
                    className="w-full bg-white border border-[#bfc9c3] rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#404944] mb-1">Inspection Date</label>
                  <input
                    type="text"
                    value={inspectedDate}
                    onChange={(e) => setInspectedDate(e.target.value)}
                    className="w-full bg-white border border-[#bfc9c3] rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/50 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#404944] block">
                  Add High-Res Property Image URL
                </span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 bg-[#fbf9f8] border border-[#bfc9c3] rounded-lg px-3.5 py-2 text-xs text-[#1b1c1c]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImage(newImageUrl.trim())}
                    className="bg-[#003527] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#064e3b] cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add URL
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-[#707974] block mb-2">
                    Quick Sample Photo Presets for Port Harcourt Properties:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SAMPLE_IMAGE_BANK.map((sampleUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleAddImage(sampleUrl)}
                        className="relative group cursor-pointer rounded-lg overflow-hidden border border-[#bfc9c3]/40 aspect-video"
                      >
                        <img src={sampleUrl} alt="Sample" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                          + Add
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current Images List */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#404944] block">
                  Current Gallery Images ({images.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-xl overflow-hidden border border-[#bfc9c3]/50 bg-white shadow-xs"
                    >
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-36 object-cover" />
                      <div className="p-2.5 flex items-center justify-between bg-white text-xs">
                        <span className="font-semibold text-[#707974]">
                          {idx === 0 ? '★ Primary Cover' : `Photo #${idx + 1}`}
                        </span>
                        {images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="text-[#ba1a1a] hover:bg-[#ba1a1a]/10 p-1.5 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FEATURES & AMENITIES */}
          {activeTab === 'features' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Features */}
              <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/50 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#404944] block">
                  Property Highlights & Finishes
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="e.g. Private Lap Swimming Pool, 30kVA Generator, Italian Kitchen"
                    className="flex-1 bg-[#fbf9f8] border border-[#bfc9c3] rounded-lg px-3.5 py-2 text-xs text-[#1b1c1c]"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="bg-[#003527] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#064e3b] cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#003527]/10 text-[#003527] text-xs font-medium"
                    >
                      {feat}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="hover:text-[#ba1a1a] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/50 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#404944] block">
                  Estate Amenities & Infrastructure
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAmenity();
                      }
                    }}
                    placeholder="e.g. 24/7 Armed Patrol, High-Speed Fiber Internet, Industrial Borehole"
                    className="flex-1 bg-[#fbf9f8] border border-[#bfc9c3] rounded-lg px-3.5 py-2 text-xs text-[#1b1c1c]"
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="bg-[#003527] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#064e3b] cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {amenities.map((am, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fed65b]/30 text-[#735c00] text-xs font-medium"
                    >
                      {am}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(idx)}
                        className="hover:text-[#ba1a1a] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#bfc9c3]/40 flex items-center justify-end gap-3">
            <button
              type="button"
              id="btn-cancel-editor"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#bfc9c3] text-[#404944] hover:bg-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-property-listing"
              className="px-6 py-2.5 rounded-xl bg-[#003527] text-white hover:bg-[#064e3b] text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#fed65b]" />
              {property ? 'Save Changes' : 'Publish Verified Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
