import React, { useState } from 'react';
import { Building2, Edit3, ImagePlus, Plus, Save, Trash2, X } from 'lucide-react';
import { BusinessPromotion, PromotionCategory } from '../../types';
import { supabaseDb } from '../../lib/supabase';

interface AdminPromotionsManagerProps {
  promotions: BusinessPromotion[];
  onSave: (promotion: BusinessPromotion) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const categories: PromotionCategory[] = [
  'Property Management',
  'Property Consulting',
  'Property Valuation',
  'Verified Partner',
  'Other Service',
];

const emptyPromotion = (): BusinessPromotion => ({
  id: '',
  businessName: '',
  category: 'Property Management',
  description: '',
  ctaLabel: 'Learn More',
  isActive: true,
  displayOrder: 0,
});

export const AdminPromotionsManager: React.FC<AdminPromotionsManagerProps> = ({ promotions, onSave, onDelete }) => {
  const [editing, setEditing] = useState<BusinessPromotion | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    if (!editing.businessName.trim() || editing.description.trim().length < 10) {
      setError('Enter a business name and a description of at least 10 characters.');
      return;
    }
    setSaving(true);
    setError('');
    const ok = await onSave(editing);
    setSaving(false);
    if (ok) setEditing(null);
    else setError('The promotion could not be saved. Please try again.');
  };

  const uploadImage = async (file?: File) => {
    if (!file || !editing) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Choose a JPG, PNG or WebP image no larger than 5 MB.');
      return;
    }
    setUploading(true);
    setError('');
    const url = await supabaseDb.uploadBusinessPromotionImage(file);
    setUploading(false);
    if (!url) setError('The promotional image could not be uploaded.');
    else setEditing({ ...editing, imageUrl: url });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#bfc9c3]/40 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#003527]">Homepage Promotions</h2>
          <p className="text-sm text-[#707974] mt-1">Manage property services, partners and business promotions shown on the public homepage.</p>
        </div>
        <button onClick={() => setEditing(emptyPromotion())} className="inline-flex items-center justify-center gap-2 bg-[#003527] text-white px-5 py-3 rounded-xl font-bold text-sm cursor-pointer">
          <Plus className="w-4 h-4" /> Add Promotion
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {promotions.length === 0 ? (
          <div className="lg:col-span-2 bg-white border border-dashed border-[#bfc9c3] rounded-2xl p-12 text-center">
            <Building2 className="w-10 h-10 text-[#607067] mx-auto" />
            <p className="font-bold text-[#003527] mt-3">No homepage promotions yet</p>
            <p className="text-sm text-[#707974] mt-1">Add the first service or verified business partner.</p>
          </div>
        ) : promotions.map((promotion) => (
          <article key={promotion.id} className="bg-white border border-[#bfc9c3]/40 rounded-2xl p-5 flex gap-4 shadow-xs">
            <div className="w-20 h-20 rounded-xl bg-[#f4f1e9] overflow-hidden shrink-0 flex items-center justify-center">
              {promotion.imageUrl ? <img src={promotion.imageUrl} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-8 h-8 text-[#003527]" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-[#003527]">{promotion.businessName}</h3>
                  <p className="text-xs text-[#735c00] mt-1">{promotion.category} · Order {promotion.displayOrder}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${promotion.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {promotion.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <p className="text-sm text-[#707974] mt-2 line-clamp-2">{promotion.description}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setEditing({ ...promotion })} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003527] border border-[#003527]/20 px-3 py-2 rounded-lg cursor-pointer">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => void onDelete(promotion.id)} className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 border border-red-200 px-3 py-2 rounded-lg cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onMouseDown={(e) => e.target === e.currentTarget && setEditing(null)}>
          <form onSubmit={submit} className="bg-[#FCF9F2] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[#003527] text-white px-6 py-4 flex items-center justify-between z-10">
              <div><h3 className="font-playfair text-xl font-bold">{editing.id ? 'Edit Promotion' : 'Add Homepage Promotion'}</h3><p className="text-xs text-white/65 mt-1">Only active promotions appear publicly.</p></div>
              <button type="button" onClick={() => setEditing(null)} className="p-2 bg-white/10 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <label className="sm:col-span-2 text-sm font-bold text-[#303632]">Business or Service Name<input required value={editing.businessName} onChange={(e) => setEditing({ ...editing, businessName: e.target.value })} className="mt-2 w-full border border-[#bfc9c3] rounded-xl px-4 py-3 font-normal bg-white" /></label>
              <label className="text-sm font-bold text-[#303632]">Category<select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as PromotionCategory })} className="mt-2 w-full border border-[#bfc9c3] rounded-xl px-4 py-3 font-normal bg-white">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="text-sm font-bold text-[#303632]">Display Order<input type="number" min="0" value={editing.displayOrder} onChange={(e) => setEditing({ ...editing, displayOrder: Math.max(0, Number(e.target.value)) })} className="mt-2 w-full border border-[#bfc9c3] rounded-xl px-4 py-3 font-normal bg-white" /></label>
              <label className="sm:col-span-2 text-sm font-bold text-[#303632]">Short Description<textarea required minLength={10} maxLength={500} rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-2 w-full border border-[#bfc9c3] rounded-xl px-4 py-3 font-normal bg-white resize-y" /></label>
              <label className="text-sm font-bold text-[#303632]">Contact Phone<input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="mt-2 w-full border border-[#bfc9c3] rounded-xl px-4 py-3 font-normal bg-white" placeholder="0800 000 0000" /></label>
              <label className="text-sm font-bold text-[#303632]">Website or Page Link<input type="url" value={editing.linkUrl || ''} onChange={(e) => setEditing({ ...editing, linkUrl: e.target.value })} className="mt-2 w-full border border-[#bfc9c3] rounded-xl px-4 py-3 font-normal bg-white" placeholder="https://..." /></label>
              <label className="text-sm font-bold text-[#303632]">Button Label<input value={editing.ctaLabel} onChange={(e) => setEditing({ ...editing, ctaLabel: e.target.value })} className="mt-2 w-full border border-[#bfc9c3] rounded-xl px-4 py-3 font-normal bg-white" /></label>
              <label className="text-sm font-bold text-[#303632] flex items-center gap-3 mt-7"><input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="w-5 h-5 accent-[#003527]" /> Active on homepage</label>
              <div className="sm:col-span-2 border border-dashed border-[#8ca097] rounded-xl p-4 bg-white">
                <p className="text-sm font-bold text-[#303632]">Logo or Promotional Image</p>
                <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-[#f4f1e9] overflow-hidden flex items-center justify-center">{editing.imageUrl ? <img src={editing.imageUrl} alt="Preview" className="w-full h-full object-cover" /> : <ImagePlus className="w-8 h-8 text-[#607067]" />}</div>
                  <label className="inline-flex items-center gap-2 bg-[#f0eee8] px-4 py-3 rounded-xl text-sm font-bold text-[#003527] cursor-pointer"><ImagePlus className="w-4 h-4" />{uploading ? 'Uploading...' : 'Upload Image'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(e) => void uploadImage(e.target.files?.[0])} className="hidden" /></label>
                </div>
              </div>
              {error && <p className="sm:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
            </div>
            <div className="sticky bottom-0 bg-white border-t border-[#bfc9c3]/40 px-6 py-4 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-3 rounded-xl border border-[#bfc9c3] font-bold text-sm cursor-pointer">Cancel</button>
              <button disabled={saving || uploading} className="px-5 py-3 rounded-xl bg-[#003527] text-white font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Promotion'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
