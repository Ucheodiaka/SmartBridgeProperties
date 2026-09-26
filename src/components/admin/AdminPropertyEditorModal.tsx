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
  const [isNegotiable, setIsNegotiable] = useState<boolean>(false);
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
      setIsNegotiable(Boolean(property.isNegotiable));
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
      setIsNegotiable(false);
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
      isNegotiable,
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
        id="admin-property-evßmí¢G§²ÚîÆ­yÒ·GÐ¢Âö÷F–öãà¢’—Ð¢Â÷6VÆV7Cà¢ÂöF—cà ¢ÆF—cà¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçBÖ&öÆBWW&66RG&6¶–ær×v–FW"FW‡BÕ²3CC“CEÒÖ"ÓãR#à¢æV–v†&÷&†ööB ¢ÂöÆ&VÃà¢Ç6VÆV7@¢–CÒ'6VÆV7B×&÷ÖæV–v†&÷&†ööB ¢fÇVS×¶æV–v†&÷&†ööGÐ¢öä6†ævS×²†R’Óâ6WDæV–v†&÷&†ööB†RçF&vWBçfÇVR2ç’—Ð¢6Æ74æÖSÒ'rÖgVÆÂ&r×v†—FR&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆr‚ÓB’Ó"ãRFW‡B×6ÒFW‡BÕ²3#35Òfö7W3¦÷WFÆ–æRÖæöæRfö7W3¦&÷&FW"Õ²33S#uÒ ¢à¢´äT”t„$õ$„ôôEôõD”ôå2æÖ‚†æ"’Óâ€¢Æ÷F–öâ¶W“×¶æ'ÒfÇVS×¶æ'Óà¢¶æ'Ð¢Âö÷F–öãà¢’—Ð¢Â÷6VÆV7Cà¢ÂöF—cà¢ÂöF—cà ¢ÆF—b6Æ74æÖSÒ&w&–Bw&–BÖ6öÇ2ÓÖC¦w&–BÖ6öÇ2Ó"vÓB#à¢ÆF—cà¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçBÖ&öÆBWW&66RG&6¶–ær×v–FW"FW‡BÕ²3CC“CEÒÖ"ÓãR#à¢gVÆÂ‡—6–6ÂFG&W72 ¢ÂöÆ&VÃà¢Æ–çW@¢–CÒ&–çWB×&÷ÖFG&W72 ¢G—SÒ'FW‡B ¢&WV—&V@¢fÇVS×¶FG&W77Ð¢öä6†ævS×²†R’Óâ6WDFG&W72†RçF&vWBçfÇVR—Ð¢Æ6V†öÆFW#Ò&RærâÆ÷BBÂ&W6–FVçF–Â6V7F–öâÂu$†6R"Â÷'B†&6÷W'B ¢6Æ74æÖSÒ'rÖgVÆÂ&r×v†—FR&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆr‚ÓB’Ó"ãRFW‡B×6ÒFW‡BÕ²3#35Òfö7W3¦÷WFÆ–æRÖæöæRfö7W3¦&÷&FW"Õ²33S#uÒ ¢óà¢ÂöF—cà ¢ÆF—cà¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçBÖ&öÆBWW&66RG&6¶–ær×v–FW"FW‡BÕ²3CC“CEÒÖ"ÓãR#à¢&–6R–âæ—&Ž(*b’¢¶Æ—7F–æuG—RÓÓÒw&VçBròr„æçVÂ&VçB’r¢r„6¶–ær&–6R’wÐ¢ÂöÆ&VÃà¢ÆF—b6Æ74æÖSÒ'&VÆF—fR#à¢Ç7â6Æ74æÖSÒ&'6öÇWFRÆVgBÓ2ãRF÷Ó"ãRFW‡B×6ÒföçBÖ&öÆBFW‡BÕ²3ss“sEÒ#î(*cÂ÷7ãà¢Æ–çW@¢–CÒ&–çWB×&÷×&–6R ¢G—SÒ&çVÖ&W" ¢&WV—&V@¢Ö–ã×³Ð¢7FW×³SÐ¢fÇVS×·&–6WÐ¢öä6†ævS×²†R’Óâ6WE&–6R„çVÖ&W"†RçF&vWBçfÇVR’—Ð¢6Æ74æÖSÒ'rÖgVÆÂ&r×v†—FR&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆrÂÓ‚"ÓB’Ó"ãRFW‡B×6ÒFW‡BÕ²3#35ÒföçB×6VÖ–&öÆBfö7W3¦÷WFÆ–æRÖæöæRfö7W3¦&÷&FW"Õ²33S#uÒ ¢óà¢ÂöF—cà¢ÆÆ&VÂ6Æ74æÖSÒ&×BÓ"fÆW‚—FV×2Ö6VçFW"vÓ"FW‡B×‡2föçB×6VÖ–&öÆBFW‡BÕ²3CC“CEÒ7W'6÷"×ö–çFW"#à¢Æ–çW@¢G—SÒ&6†V6¶&÷‚ ¢6†V6¶VC×¶—4æVv÷F–&ÆWÐ¢öä6†ævS×²†R’Óâ6WD—4æVv÷F–&ÆR†RçF&vWBæ6†V6¶VB—Ð¢6Æ74æÖSÒ&‚ÓBrÓB66VçBÕ²33S#uÒ ¢óà¢&–6R—2æVv÷F–&ÆP¢ÂöÆ&VÃà¢Ç6Æ74æÖSÒ'FW‡BÕ³…ÒFW‡BÕ²3ss“sEÒ×BÓ#à¢F—7Æ’&Wf–Ws¢¶f÷&ÖDæ—&F—7Æ’‡&–6RÂÆ—7F–æuG—R—Ò¶Æ—7F–æuG—RÓÓÒw&VçBròr÷—"r¢rwÐ¢Â÷à¢ÂöF—cà¢ÂöF—cà ¢²ò¢7V6–f–6F–öç3¢&VG2Â&F‡2Â&¶–ærÂ6—¦R¢÷Ð¢ÆF—b6Æ74æÖSÒ&w&–Bw&–BÖ6öÇ2Ó"ÖC¦w&–BÖ6öÇ2ÓBvÓ2&r×v†—FRÓB&÷VæFVB×†Â&÷&FW"&÷&FW"Õ²6&f3–35ÒóS#à¢ÆF—cà¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçB×6VÖ–&öÆBFW‡BÕ²3CC“CEÒÖ"Ó#ä&VG&öö×3ÂöÆ&VÃà¢Æ–çW@¢G—SÒ&çVÖ&W" ¢Ö–ã×³Ð¢Öƒ×³#Ð¢fÇVS×¶&VG&öö×7Ð¢öä6†ævS×²†R’Óâ6WD&VG&öö×2„çVÖ&W"†RçF&vWBçfÇVR’—Ð¢6Æ74æÖSÒ'rÖgVÆÂ&rÕ²6f&c–c…Ò&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆr‚Ó2’Ó"FW‡B×6ÒFW‡BÖ6VçFW"föçBÖ&öÆB ¢óà¢ÂöF—cà¢ÆF—cà¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçB×6VÖ–&öÆBFW‡BÕ²3CC“CEÒÖ"Ó#ä&F‡&öö×3ÂöÆ&VÃà¢Æ–çW@¢G—SÒ&çVÖ&W" ¢Ö–ã×³Ð¢Öƒ×³#Ð¢fÇVS×¶&F‡&öö×7Ð¢öä6†ævS×²†R’Óâ6WD&F‡&öö×2„çVÖ&W"†RçF&vWBçfÇVR’—Ð¢6Æ74æÖSÒ'rÖgVÆÂ&rÕ²6f&c–c…Ò&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆr‚Ó2’Ó"FW‡B×6ÒFW‡BÖ6VçFW"föçBÖ&öÆB ¢óà¢ÂöF—cà¢ÆF—cà¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçB×6VÖ–&öÆBFW‡BÕ²3CC“CEÒÖ"Ó#å&¶–ær&—3ÂöÆ&VÃà¢Æ–çW@¢G—SÒ&çVÖ&W" ¢Ö–ã×³Ð¢Öƒ×³#Ð¢fÇVS×·&¶–æu76W7Ð¢öä6†ævS×²†R’Óâ6WE&¶–æu76W2„çVÖ&W"†RçF&vWBçfÇVR’—Ð¢6Æ74æÖSÒ'rÖgVÆÂ&rÕ²6f&c–c…Ò&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆr‚Ó2’Ó"FW‡B×6ÒFW‡BÖ6VçFW"föçBÖ&öÆB ¢óà¢ÂöF—cà¢ÆF—cà¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçB×6VÖ–&öÆBFW‡BÕ²3CC“CEÒÖ"Ó#äfÆö÷"&V…7gB“ÂöÆ&VÃà¢Æ–çW@¢G—SÒ&çVÖ&W" ¢Ö–ã×³SÐ¢7FW×³Ð¢fÇVS×·6—¦U7gGÐ¢öä6†ævS×²†R’Óâ6WE6—¦U7gB„çVÖ&W"†RçF&vWBçfÇVR’—Ð¢6Æ74æÖSÒ'rÖgVÆÂ&rÕ²6f&c–c…Ò&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆr‚Ó2’Ó"FW‡B×6ÒFW‡BÖ6VçFW"föçBÖ&öÆB ¢óà¢ÂöF—cà¢ÂöF—cà ¢²ò¢&FvW2b76–væVBvVçB¢÷Ð¢ÆF—b6Æ74æÖSÒ&w&–Bw&–BÖ6öÇ2ÓÖC¦w&–BÖ6öÇ2Ó"vÓB#à¢ÆF—b6Æ74æÖSÒ&&r×v†—FRÓB&÷VæFVB×†Â&÷&FW"&÷&FW"Õ²6&f3–35ÒóS76R×’Ó2#à¢Ç7â6Æ74æÖSÒ'FW‡B×‡2föçBÖ&öÆBWW&66RG&6¶–ær×v–FW"FW‡BÕ²3CC“CEÒ&Æö6²#à¢f—6–&–Æ—G’b&FvW0¢Â÷7ãà¢ÆÆ&VÂ6Æ74æÖSÒ&fÆW‚—FV×2Ö6VçFW"vÓ27W'6÷"×ö–çFW"#à¢Æ–çW@¢G—SÒ&6†V6¶&÷‚ ¢6†V6¶VC×¶—5fW&–f–VGÐ¢öä6†ævS×²†R’Óâ6WD—5fW&–f–VB†RçF&vWBæ6†V6¶VB—Ð¢6Æ74æÖSÒ'rÓB‚ÓBFW‡BÕ²33S#uÒ&÷VæFVB×6Òfö7W3§&–ærÕ²33S#uÒ ¢óà¢ÆF—cà¢Ç7â6Æ74æÖSÒ'FW‡B×6ÒföçB×6VÖ–&öÆBFW‡BÕ²3#35Ò&Æö6²#å6Ö'D'&–FvRfW&–f–VCÂ÷7ãà¢Ç7â6Æ74æÖSÒ'FW‡B×‡2FW‡BÕ²3ss“sEÒ#äF—7Æ—2F†R&÷fVBÆ—7F–ær&FvSÂ÷7ãà¢ÂöF—cà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ74æÖSÒ&fÆW‚—FV×2Ö6VçFW"vÓ27W'6÷"×ö–çFW"#à¢Æ–çW@¢G—SÒ&6†V6¶&÷‚ ¢6†V6¶VC×¶—4fVGW&VGÐ¢öä6†ævS×²†R’Óâ6WD—4fVGW&VB†RçF&vWBæ6†V6¶VB—Ð¢6Æ74æÖSÒ'rÓB‚ÓBFW‡BÕ²33S#uÒ&÷VæFVB×6Òfö7W3§&–ærÕ²33S#uÒ ¢óà¢ÆF—cà¢Ç7â6Æ74æÖSÒ'FW‡B×6ÒföçB×6VÖ–&öÆBFW‡BÕ²3#35Ò&Æö6²#äfVGW&VBöâ†öÖWvSÂ÷7ãà¢Ç7â6Æ74æÖSÒ'FW‡B×‡2FW‡BÕ²3ss“sEÒ#å&öÖ÷FVB–â&–ÖR7÷FÆ–v‡B6V7F–öãÂ÷7ãà¢ÂöF—cà¢ÂöÆ&VÃà¢ÂöF—cà ¢ÂöF—cà ¢²ò¢FW67&—F–öâ¢÷Ð¢ÆF—cà¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçBÖ&öÆBWW&66RG&6¶–ær×v–FW"FW‡BÕ²3CC“CEÒÖ"ÓãR#à¢FWF–ÆVBFW67&—F–öâ ¢ÂöÆ&VÃà¢ÇFW‡F&V¢&÷w3×³GÐ¢&WV—&V@¢fÇVS×¶FW67&—F–öçÐ¢öä6†ævS×²†R’Óâ6WDFW67&—F–öâ†RçF&vWBçfÇVR—Ð¢Æ6V†öÆFW#Ò%&÷f–FRâ÷fW'f–Wröb&6†—FV7GW&Â†–v†Æ–v‡G2ÂW7FFR6V7W&—G’Âf–æ—6†W2ÂæBæV–v†&÷W&†ööBW&·2âââ ¢6Æ74æÖSÒ'rÖgVÆÂ&r×v†—FR&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆrÓ2ãRFW‡B×6ÒFW‡BÕ²3#35Òfö7W3¦÷WFÆ–æRÖæöæRfö7W3¦&÷&FW"Õ²33S#uÒ ¢óà¢ÂöF—cà¢ÂöF—cà¢—Ð ¢²ò¢D"#¢”å5T5D”ôâbTD•B¢÷Ð¢¶7F—fUF"ÓÓÒv–ç7V7F–öârbb€¢ÆF—b6Æ74æÖSÒ'76R×’ÓRæ–ÖFRÖ–âfFRÖ–â#à¢ÆF—b6Æ74æÖSÒ&&rÕ²33S#uÒóR&÷&FW"&÷&FW"Õ²33S#uÒó#ÓB&÷VæFVB×†ÂfÆW‚—FV×2×7F'BvÓ2#à¢Å6†–VÆD6†V6²6Æ74æÖSÒ'rÓR‚ÓRFW‡BÕ²33S#uÒ6‡&–æ²Ó×BÓãR"óà¢ÆF—b6Æ74æÖSÒ'FW‡B×‡2FW‡BÕ²3CC“CEÒÆVF–ær×&VÆ†VB#à¢Ç7G&öær6Æ74æÖSÒ'FW‡BÕ²33S#uÒ#å‡—6–6ÂVæv–æVW&–ærbÆæB6V&6‚7FæF&C£Â÷7G&öæsâWfW'’Æ—7F–ærV&Æ—6†VBv—F‚fW&–f–6F–öâöâ6Ö'D'&–FvRVæFW&vöW2öâ×6—FRVæv–æVW&–ærFW7F–æræB&—fW'27FFRÖ–æ—7G'’öbÆæG2F—FÆR6V&6†W2à¢ÂöF—cà¢ÂöF—cà ¢ÆF—b6Æ74æÖSÒ&w&–Bw&–BÖ6öÇ2ÓÖC¦w&–BÖ6öÇ2Ó"vÓB#à¢ÆF—b6Æ74æÖSÒ&&r×v†—FRÓB&÷VæFVB×†Â&÷&FW"&÷&FW"Õ²6&f3–35ÒóS76R×’Ó2#à¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçBÖ&öÆBWW&66RG&6¶–ær×v–FW"FW‡BÕ²3CC“CEÒ#à¢÷fW&ÆÂ–ç7V7F–öâ66÷&RƒÒ¢ÂöÆ&VÃà¢ÆF—b6Æ74æÖSÒ&fÆW‚—FV×2Ö6VçFW"vÓB#à¢Æ–çW@¢G—SÒ'&ævR ¢Ö–ã×³cÐ¢Öƒ×³Ð¢fÇVS×¶÷fW&ÆÅ66÷&WÐ¢öä6†ævS×²†R’Óâ6WD÷fW&ÆÅ66÷&R„çVÖ&W"†RçF&vWBçfÇVR’—Ð¢6Æ74æÖSÒ&fÆW‚Ó66VçBÕ²33S#uÒ ¢óà¢Ç7â6Æ74æÖSÒ&föçB×Æ–f—"FW‡BÓ'†ÂföçBÖ&öÆBFW‡BÕ²33S#uÒ‚Ó2’Ó&rÕ²6fVCcV%Òó#&÷VæFVBÖÆr#à¢¶÷fW&ÆÅ66÷&WÒP¢Â÷7ãà¢ÂöF—cà¢ÂöF—cà ¢ÆF—b6Æ74æÖSÒ&&r×v†—FRÓB&÷VæFVB×†Â&÷&FW"&÷&FW"Õ²6&f3–35ÒóS76R×’Ó2#à¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçBÖ&öÆBWW&66RG&6¶–ær×v–FW"FW‡BÕ²3CC“CEÒ#à¢F—FÆRFö7VÖVçBG—RbfW&–f–6F–öà¢ÂöÆ&VÃà¢ÆF—b6Æ74æÖSÒ&w&–Bw&–BÖ6öÇ2Ó"vÓ"#à¢Ç6VÆV7@¢fÇVS×·F—FÆTFö7VÖVçEG—WÐ¢öä6†ævS×²†R’Óâ6WEF—FÆTFö7VÖVçEG—R†RçF&vWBçfÇVR2ç’—Ð¢6Æ74æÖSÒ&&rÕ²6f&c–c…Ò&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆr‚Ó2’Ó"FW‡B×‡2föçB×6VÖ–&öÆB ¢à¢Æ÷F–öâfÇVSÒ$2öbò#ä6W'F–f–6FRöbö67Wæ7’„2öbò“Âö÷F–öãà¢Æ÷F–öâfÇVSÒ$v÷fW&æ÷"w26öç6VçB#äv÷fW&æ÷"w26öç6VçCÂö÷F–öãà¢Æ÷F–öâfÇVSÒ$FVVBöb6öçfW–æ6R#äFVVBöb6öçfW–æ6SÂö÷F–öãà¢Æ÷F–öâfÇVSÒ$v¦WGFR#äv¦WGFSÂö÷F–öãà¢Â÷6VÆV7Cà¢ÆÆ&VÂ6Æ74æÖSÒ&fÆW‚—FV×2Ö6VçFW"vÓ"FW‡B×‡2föçB×6VÖ–&öÆBFW‡BÕ²33S#uÒ7W'6÷"×ö–çFW"#à¢Æ–çW@¢G—SÒ&6†V6¶&÷‚ ¢6†V6¶VC×·F—FÆUfW&–f–VGÐ¢öä6†ævS×²†R’Óâ6WEF—FÆUfW&–f–VB†RçF&vWBæ6†V6¶VB—Ð¢6Æ74æÖSÒ'rÓB‚ÓBFW‡BÕ²33S#uÒ&÷VæFVB×6Ò ¢óà¢ÆæG2&Vv—7G'’fW&–f–V@¢ÂöÆ&VÃà¢ÂöF—cà¢ÂöF—cà¢ÂöF—cà ¢ÆF—b6Æ74æÖSÒ&w&–Bw&–BÖ6öÇ2ÓÖC¦w&–BÖ6öÇ2Ó2vÓB#à¢ÆF—b6Æ74æÖSÒ&&r×v†—FRÓB&÷VæFVB×†Â&÷&FW"&÷&FW"Õ²6&f3–35ÒóS#à¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçBÖ&öÆBFW‡BÕ²3CC“CEÒÖ"Ó#äfÆööB&—6²&F–æsÂöÆ&VÃà¢Ç6VÆV7@¢fÇVS×¶fÆööE&—6·Ð¢öä6†ævS×²†R’Óâ6WDfÆööE&—6²†RçF&vWBçfÇVR2ç’—Ð¢6Æ74æÖSÒ'rÖgVÆÂ&rÕ²6f&c–c…Ò&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆrÓ"FW‡B×‡2föçB×6VÖ–&öÆB ¢à¢Æ÷F–öâfÇVSÒ%¦W&ò&—6²„VÆWfFVB’#å¦W&ò&—6²„VÆWfFVB“Âö÷F–öãà¢Æ÷F–öâfÇVSÒ$Æ÷r#äÆ÷r&—6³Âö÷F–öãà¢Æ÷F–öâfÇVSÒ$ÖöFW&FR#äÖöFW&FSÂö÷F–öãà¢Â÷6VÆV7Cà¢ÂöF—cà ¢ÆF—b6Æ74æÖSÒ&&r×v†—FRÓB&÷VæFVB×†Â&÷&FW"&÷&FW"Õ²6&f3–35ÒóS#à¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçBÖ&öÆBFW‡BÕ²3CC“CEÒÖ"Ó#å÷vW"w&–B7F&–Æ—G“ÂöÆ&VÃà¢Æ–çW@¢G—SÒ'FW‡B ¢fÇVS×·÷vW$w&–E7F&–Æ—G—Ð¢öä6†ævS×²†R’Óâ6WE÷vW$w&–E7F&–Æ—G’†RçF&vWBçfÇVR—Ð¢Æ6V†öÆFW#Ò&Rærâ#BórGVÂvVâ²6öÆ" ¢6Æ74æÖSÒ'rÖgVÆÂ&rÕ²6f&c–c…Ò&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆrÓ"FW‡B×‡2föçB×6VÖ–&öÆB ¢óà¢ÂöF—cà ¢ÆF—b6Æ74æÖSÒ&&r×v†—FRÓB&÷VæFVB×†Â&÷&FW"&÷&FW"Õ²6&f3–35ÒóS#à¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçBÖ&öÆBFW‡BÕ²3CC“CEÒÖ"Ó#å6V7W&—G’&F–æsÂöÆ&VÃà¢Æ–çW@¢G—SÒ'FW‡B ¢fÇVS×·6V7W&—G•&F–æwÐ¢öä6†ævS×²†R’Óâ6WE6V7W&—G•&F–ær†RçF&vWBçfÇVR—Ð¢Æ6V†öÆFW#Ò&Rærâw&FR²„&ÖVBG&öÂ’ ¢6Æ74æÖSÒ'rÖgVÆÂ&rÕ²6f&c–c…Ò&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆrÓ"FW‡B×‡2föçB×6VÖ–&öÆB ¢óà¢ÂöF—cà¢ÂöF—cà ¢ÆF—b6Æ74æÖSÒ&w&–Bw&–BÖ6öÇ2ÓÖC¦w&–BÖ6öÇ2Ó2vÓB#à¢ÆF—cà¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçB×6VÖ–&öÆBFW‡BÕ²3CC“CEÒÖ"Ó#äÆVB–ç7V7F÷"æÖSÂöÆ&VÃà¢Æ–çW@¢G—SÒ'FW‡B ¢fÇVS×¶–ç7V7F÷$æÖWÐ¢öä6†ævS×²†R’Óâ6WD–ç7V7F÷$æÖR†RçF&vWBçfÇVR—Ð¢6Æ74æÖSÒ'rÖgVÆÂ&r×v†—FR&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆrÓ"FW‡B×‡2 ¢óà¢ÂöF—cà¢ÆF—cà¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçB×6VÖ–&öÆBFW‡BÕ²3CC“CEÒÖ"Ó#ä–ç7V7F÷"”B&FvSÂöÆ&VÃà¢Æ–çW@¢G—SÒ'FW‡B ¢fÇVS×¶–ç7V7F÷$–GÐ¢öä6†ævS×²†R’Óâ6WD–ç7V7F÷$–B†RçF&vWBçfÇVR—Ð¢6Æ74æÖSÒ'rÖgVÆÂ&r×v†—FR&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆrÓ"FW‡B×‡2 ¢óà¢ÂöF—cà¢ÆF—cà¢ÆÆ&VÂ6Æ74æÖSÒ&&Æö6²FW‡B×‡2föçB×6VÖ–&öÆBFW‡BÕ²3CC“CEÒÖ"Ó#ä–ç7V7F–öâFFSÂöÆ&VÃà¢Æ–çW@¢G—SÒ'FW‡B ¢fÇVS×¶–ç7V7FVDFFWÐ¢öä6†ævS×²†R’Óâ6WD–ç7V7FVDFFR†RçF&vWBçfÇVR—Ð¢6Æ74æÖSÒ'rÖgVÆÂ&r×v†—FR&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆrÓ"FW‡B×‡2 ¢óà¢ÂöF—cà¢ÂöF—cà¢ÂöF—cà¢—Ð ¢²ò¢D"3¢ÔTD”¢÷Ð¢¶7F—fUF"ÓÓÒvÖVF–rbb€¢ÆF—b6Æ74æÖSÒ'76R×’ÓRæ–ÖFRÖ–âfFRÖ–â#à¢ÆF—b6Æ74æÖSÒ&&r×v†—FRÓB&÷VæFVB×†Â&÷&FW"&÷&FW"Õ²6&f3–35ÒóS76R×’Ó2#à¢Ç7â6Æ74æÖSÒ'FW‡B×‡2föçBÖ&öÆBWW&66RG&6¶–ær×v–FW"FW‡BÕ²3CC“CEÒ&Æö6²#à¢FB†–v‚Õ&W2&÷W'G’–ÖvRU$À¢Â÷7ãà¢ÆF—b6Æ74æÖSÒ&fÆW‚vÓ"#à¢Æ–çW@¢G—SÒ'W&Â ¢fÇVS×¶æWt–ÖvUW&ÇÐ¢öä6†ævS×²†R’Óâ6WDæWt–ÖvUW&Â†RçF&vWBçfÇVR—Ð¢Æ6V†öÆFW#Ò%7FR–ÖvRU$Â†‡GG3¢òòâââ’ ¢6Æ74æÖSÒ&fÆW‚Ó&rÕ²6f&c–c…Ò&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆr‚Ó2ãR’Ó"FW‡B×‡2FW‡BÕ²3#35Ò ¢óà¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢öä6Æ–6³×²‚’Óâ†æFÆTFD–ÖvR†æWt–ÖvUW&ÂçG&–Ò‚’—Ð¢6Æ74æÖSÒ&&rÕ²33S#uÒFW‡B×v†—FRFW‡B×‡2föçBÖ&öÆB‚ÓB’Ó"&÷VæFVBÖÆr†÷fW#¦&rÕ²3cFS6%Ò7W'6÷"×ö–çFW"fÆW‚—FV×2Ö6VçFW"vÓãR ¢à¢ÅÇW26Æ74æÖSÒ'rÓ2ãR‚Ó2ãR"óâFBU$À¢Âö'WGFöãà¢ÂöF—cà ¢²ò¢V–6²&W6WG2¢÷Ð¢ÆF—b6Æ74æÖSÒ'BÓ"#à¢Ç7â6Æ74æÖSÒ'FW‡BÕ³…ÒföçB×6VÖ–&öÆBFW‡BÕ²3ss“sEÒ&Æö6²Ö"Ó"#à¢V–6²6×ÆR†÷Fò&W6WG2f÷"÷'B†&6÷W'B&÷W'F–W3 ¢Â÷7ãà¢ÆF—b6Æ74æÖSÒ&w&–Bw&–BÖ6öÇ2Ó"6Ó¦w&–BÖ6öÇ2ÓBvÓ"#à¢µ4ÕÄUô”ÔtUô$ä²æÖ‚‡6×ÆUW&ÂÂ–G‚’Óâ€¢ÆF—`¢¶W“×¶–G‡Ð¢öä6Æ–6³×²‚’Óâ†æFÆTFD–ÖvR‡6×ÆUW&Â—Ð¢6Æ74æÖSÒ'&VÆF—fRw&÷W7W'6÷"×ö–çFW"&÷VæFVBÖÆr÷fW&fÆ÷rÖ†–FFVâ&÷&FW"&÷&FW"Õ²6&f3–35ÒóC7V7B×f–FVò ¢à¢Æ–Ör7&3×·6×ÆUW&ÇÒÇCÒ%6×ÆR"6Æ74æÖSÒ'rÖgVÆÂ‚ÖgVÆÂö&¦V7BÖ6÷fW""óà¢ÆF—b6Æ74æÖSÒ&'6öÇWFR–ç6WBÓ&rÖ&Æ6²óC÷6—G’Ów&÷WÖ†÷fW#¦÷6—G’ÓfÆW‚—FV×2Ö6VçFW"§W7F–g’Ö6VçFW"FW‡B×v†—FRFW‡B×‡2föçBÖ&öÆBG&ç6—F–öâÖ÷6—G’#à¢²F@¢ÂöF—cà¢ÂöF—cà¢’—Ð¢ÂöF—cà¢ÂöF—cà¢ÂöF—cà ¢²ò¢7W'&VçB–ÖvW2Æ—7B¢÷Ð¢ÆF—b6Æ74æÖSÒ'76R×’Ó2#à¢Ç7â6Æ74æÖSÒ'FW‡B×‡2föçBÖ&öÆBWW&66RG&6¶–ær×v–FW"FW‡BÕ²3CC“CEÒ&Æö6²#à¢7W'&VçBvÆÆW'’–ÖvW2‡¶–ÖvW2æÆVæwF‡Ò¢Â÷7ãà¢ÆF—b6Æ74æÖSÒ&w&–Bw&–BÖ6öÇ2Ó6Ó¦w&–BÖ6öÇ2Ó"ÖC¦w&–BÖ6öÇ2Ó2vÓ2#à¢¶–ÖvW2æÖ‚†–ÖrÂ–G‚’Óâ€¢ÆF—`¢¶W“×¶–G‡Ð¢6Æ74æÖSÒ'&VÆF—fRw&÷W&÷VæFVB×†Â÷fW&fÆ÷rÖ†–FFVâ&÷&FW"&÷&FW"Õ²6&f3–35ÒóS&r×v†—FR6†F÷r×‡2 ¢à¢Æ–Ör7&3×¶–ÖwÒÇC×¶vÆÆW'’G¶–G‚²ÖÒ6Æ74æÖSÒ'rÖgVÆÂ‚Ó3bö&¦V7BÖ6÷fW""óà¢ÆF—b6Æ74æÖSÒ'Ó"ãRfÆW‚—FV×2Ö6VçFW"§W7F–g’Ö&WGvVVâ&r×v†—FRFW‡B×‡2#à¢Ç7â6Æ74æÖSÒ&föçB×6VÖ–&öÆBFW‡BÕ²3ss“sEÒ#à¢¶–G‚ÓÓÒò~)ˆR&–Ö'’6÷fW"r¢†÷Fò2G¶–G‚²ÖÐ¢Â÷7ãà¢¶–ÖvW2æÆVæwF‚âbb€¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢öä6Æ–6³×²‚’Óâ†æFÆU&VÖ÷fT–ÖvR†–G‚—Ð¢6Æ74æÖSÒ'FW‡BÕ²6&Ò†÷fW#¦&rÕ²6&ÒóÓãR&÷VæFVBÖÖBG&ç6—F–öâÖ6öÆ÷'27W'6÷"×ö–çFW" ¢à¢ÅG&6ƒ"6Æ74æÖSÒ'rÓB‚ÓB"óà¢Âö'WGFöãà¢—Ð¢ÂöF—cà¢ÂöF—cà¢’—Ð¢ÂöF—cà¢ÂöF—cà¢ÂöF—cà¢—Ð ¢²ò¢D"C¢dTEU$U2bÔTä•D”U2¢÷Ð¢¶7F—fUF"ÓÓÒvfVGW&W2rbb€¢ÆF—b6Æ74æÖSÒ'76R×’Óbæ–ÖFRÖ–âfFRÖ–â#à¢²ò¢fVGW&W2¢÷Ð¢ÆF—b6Æ74æÖSÒ&&r×v†—FRÓB&÷VæFVB×†Â&÷&FW"&÷&FW"Õ²6&f3–35ÒóS76R×’Ó2#à¢Ç7â6Æ74æÖSÒ'FW‡B×‡2föçBÖ&öÆBWW&66RG&6¶–ær×v–FW"FW‡BÕ²3CC“CEÒ&Æö6²#à¢&÷W'G’†–v†Æ–v‡G2bf–æ—6†W0¢Â÷7ãà¢ÆF—b6Æ74æÖSÒ&fÆW‚vÓ"#à¢Æ–çW@¢G—SÒ'FW‡B ¢fÇVS×¶æWtfVGW&WÐ¢öä6†ævS×²†R’Óâ6WDæWtfVGW&R†RçF&vWBçfÇVR—Ð¢öä¶W”F÷vã×²†R’Óâ°¢–b†Ræ¶W’ÓÓÒtVçFW"r’°¢Rç&WfVçDFVfVÇB‚“°¢†æFÆTFDfVGW&R‚“°¢Ð¢×Ð¢Æ6V†öÆFW#Ò&Rærâ&—fFRÆ7v–ÖÖ–ærööÂÂ3µdvVæW&F÷"Â—FÆ–â¶—F6†Vâ ¢6Æ74æÖSÒ&fÆW‚Ó&rÕ²6f&c–c…Ò&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆr‚Ó2ãR’Ó"FW‡B×‡2FW‡BÕ²3#35Ò ¢óà¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢öä6Æ–6³×¶†æFÆTFDfVGW&WÐ¢6Æ74æÖSÒ&&rÕ²33S#uÒFW‡B×v†—FRFW‡B×‡2föçBÖ&öÆB‚ÓB’Ó"&÷VæFVBÖÆr†÷fW#¦&rÕ²3cFS6%Ò7W'6÷"×ö–çFW"fÆW‚—FV×2Ö6VçFW"vÓ ¢à¢ÅÇW26Æ74æÖSÒ'rÓ2ãR‚Ó2ãR"óâF@¢Âö'WGFöãà¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ&fÆW‚fÆW‚×w&vÓ"BÓ"#à¢¶fVGW&W2æÖ‚†fVBÂ–G‚’Óâ€¢Ç7à¢¶W“×¶–G‡Ð¢6Æ74æÖSÒ&–æÆ–æRÖfÆW‚—FV×2Ö6VçFW"vÓãR‚Ó2’ÓãR&÷VæFVBÖÆr&rÕ²33S#uÒóFW‡BÕ²33S#uÒFW‡B×‡2föçBÖÖVF—VÒ ¢à¢¶fVGÐ¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢öä6Æ–6³×²‚’Óâ†æFÆU&VÖ÷fTfVGW&R†–G‚—Ð¢6Æ74æÖSÒ&†÷fW#§FW‡BÕ²6&Ò7W'6÷"×ö–çFW" ¢à¢Å‚6Æ74æÖSÒ'rÓ2ãR‚Ó2ãR"óà¢Âö'WGFöãà¢Â÷7ãà¢’—Ð¢ÂöF—cà¢ÂöF—cà ¢²ò¢ÖVæ—F–W2¢÷Ð¢ÆF—b6Æ74æÖSÒ&&r×v†—FRÓB&÷VæFVB×†Â&÷&FW"&÷&FW"Õ²6&f3–35ÒóS76R×’Ó2#à¢Ç7â6Æ74æÖSÒ'FW‡B×‡2föçBÖ&öÆBWW&66RG&6¶–ær×v–FW"FW‡BÕ²3CC“CEÒ&Æö6²#à¢W7FFRÖVæ—F–W2b–æg&7G'V7GW&P¢Â÷7ãà¢ÆF—b6Æ74æÖSÒ&fÆW‚vÓ"#à¢Æ–çW@¢G—SÒ'FW‡B ¢fÇVS×¶æWtÖVæ—G—Ð¢öä6†ævS×²†R’Óâ6WDæWtÖVæ—G’†RçF&vWBçfÇVR—Ð¢öä¶W”F÷vã×²†R’Óâ°¢–b†Ræ¶W’ÓÓÒtVçFW"r’°¢Rç&WfVçDFVfVÇB‚“°¢†æFÆTFDÖVæ—G’‚“°¢Ð¢×Ð¢Æ6V†öÆFW#Ò&Rærâ#Bór&ÖVBG&öÂÂ†–v‚Õ7VVBf–&W"–çFW&æWBÂ–æGW7G&–Â&÷&V†öÆR ¢6Æ74æÖSÒ&fÆW‚Ó&rÕ²6f&c–c…Ò&÷&FW"&÷&FW"Õ²6&f3–35Ò&÷VæFVBÖÆr‚Ó2ãR’Ó"FW‡B×‡2FW‡BÕ²3#35Ò ¢óà¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢öä6Æ–6³×¶†æFÆTFDÖVæ—G—Ð¢6Æ74æÖSÒ&&rÕ²33S#uÒFW‡B×v†—FRFW‡B×‡2föçBÖ&öÆB‚ÓB’Ó"&÷VæFVBÖÆr†÷fW#¦&rÕ²3cFS6%Ò7W'6÷"×ö–çFW"fÆW‚—FV×2Ö6VçFW"vÓ ¢à¢ÅÇW26Æ74æÖSÒ'rÓ2ãR‚Ó2ãR"óâF@¢Âö'WGFöãà¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ&fÆW‚fÆW‚×w&vÓ"BÓ"#à¢¶ÖVæ—F–W2æÖ‚†ÒÂ–G‚’Óâ€¢Ç7à¢¶W“×¶–G‡Ð¢6Æ74æÖSÒ&–æÆ–æRÖfÆW‚—FV×2Ö6VçFW"vÓãR‚Ó2’ÓãR&÷VæFVBÖÆr&rÕ²6fVCcV%Òó3FW‡BÕ²3s3V3ÒFW‡B×‡2föçBÖÖVF—VÒ ¢à¢¶×Ð¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢öä6Æ–6³×²‚’Óâ†æFÆU&VÖ÷fTÖVæ—G’†–G‚—Ð¢6Æ74æÖSÒ&†÷fW#§FW‡BÕ²6&Ò7W'6÷"×ö–çFW" ¢à¢Å‚6Æ74æÖSÒ'rÓ2ãR‚Ó2ãR"óà¢Âö'WGFöãà¢Â÷7ãà¢’—Ð¢ÂöF—cà¢ÂöF—cà¢ÂöF—cà¢—Ð ¢²ò¢fö÷FW"7F–öç2¢÷Ð¢ÆF—b6Æ74æÖSÒ'BÓB&÷&FW"×B&÷&FW"Õ²6&f3–35ÒóCfÆW‚—FV×2Ö6VçFW"§W7F–g’ÖVæBvÓ2#à¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢–CÒ&'FâÖ6æ6VÂÖVF—F÷" ¢öä6Æ–6³×¶öä6Æ÷6WÐ¢6Æ74æÖSÒ'‚ÓR’Ó"ãR&÷VæFVB×†Â&÷&FW"&÷&FW"Õ²6&f3–35ÒFW‡BÕ²3CC“CEÒ†÷fW#¦&r×v†—FRFW‡B×6ÒföçB×6VÖ–&öÆBG&ç6—F–öâÖ6öÆ÷'27W'6÷"×ö–çFW" ¢à¢6æ6VÀ¢Âö'WGFöãà¢Æ'WGFöà¢G—SÒ'7V&Ö—B ¢–CÒ&'Fâ×6fR×&÷W'G’ÖÆ—7F–ær ¢6Æ74æÖSÒ'‚Ób’Ó"ãR&÷VæFVB×†Â&rÕ²33S#uÒFW‡B×v†—FR†÷fW#¦&rÕ²3cFS6%ÒFW‡B×6ÒföçBÖ&öÆB6†F÷rÖÖB†÷fW#§6†F÷rÖÆrG&ç6—F–öâÖÆÂ7W'6÷"×ö–çFW"fÆW‚—FV×2Ö6VçFW"vÓ" ¢à¢Ä6†V6´6—&6ÆS"6Æ74æÖSÒ'rÓB‚ÓBFW‡BÕ²6fVCcV%Ò"óà¢·&÷W'G’òu6fR6†ævW2r¢uV&Æ—6‚fW&–f–VB&÷W'G’wÐ¢Âö'WGFöãà¢ÂöF—cà¢Âöf÷&Óà¢ÂöF—cà¢ÂöF—cà¢“°§Ó°