import React, { useState, useRef, useEffect } from 'react';
import { categoryAPI } from '../services/api';
import { useApp } from '../contexts/AppContext';
import Modal from '../components/common/Modal';
import IconPicker, { LucideIcon } from '../components/common/IconPicker';
import { Plus, MoreVertical, Edit2, Trash2, ChevronRight, FolderPlus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const NATURES = ['None', 'Must', 'Need', 'Want'];
const TYPES   = ['expense', 'income', 'both'];
const PRESET_COLORS = [
  '#ef4444','#f97316','#f59e0b','#84cc16','#10b981',
  '#06b6d4','#6175f4','#8b5cf6','#ec4899','#14b8a6',
  '#dc2626','#65a30d','#0284c7','#7c3aed','#db2777',
];

// ─── Dot Menu ────────────────────────────────────────────────────────────────
const DotMenu = ({ onEdit, onAddSub, onDelete, canAddSub }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-[var(--bg3)] text-[var(--text3)] hover:text-[var(--text)] transition-colors"
      >
        <MoreVertical size={16}/>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-[var(--bg2)] bg-gray-700 rounded-sm shadow-modal py-1 min-w-[160px] animate-scale-in">
          <button onClick={() => { onEdit(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)] transition-colors">
            <Edit2 size={14} /> Edit
          </button>
          {canAddSub && (
            <button onClick={() => { onAddSub(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)] transition-colors">
              <FolderPlus size={14} /> Add subcategory
            </button>
          )}
          <div className="border-t border-t-gray-400 border-[var(--border)] my-1" />
          <button onClick={() => { onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Category Form Modal ──────────────────────────────────────────────────────
const CategoryForm = ({ isOpen, onClose, onSuccess, editData, parentData }) => {
  const getDefault = () => ({
    name: '', color: '#6175f4', icon: 'Tag',
    nature: 'None', type: 'expense', isVisible: true,
  });
  const [form, setForm] = useState(getDefault());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      setForm({
        name: editData.name || '',
        color: editData.color || '#6175f4',
        icon: editData.icon || 'Tag',
        nature: editData.nature || 'None',
        type: editData.type || 'expense',
        isVisible: editData.isVisible !== false,
      });
    } else if (parentData) {
      setForm(f => ({ ...getDefault(), color: parentData.color, type: parentData.type }));
    } else {
      setForm(getDefault());
    }
  }, [isOpen, editData, parentData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setLoading(true);
    try {
      if (editData) {
        await categoryAPI.update(editData._id, form);
        toast.success('Category updated!');
      } else {
        const payload = { ...form, ...(parentData ? { parent: parentData._id } : {}) };
        await categoryAPI.create(payload);
        toast.success(parentData ? 'Subcategory added!' : 'Category created!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const title = editData ? 'Edit' : parentData ? `Add subcategory to "${parentData.name}"` : 'New Category';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name + Color row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Category name" required />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="relative">
              <input
                type="text"
                value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                className="input pl-10 font-mono text-sm"
                placeholder="#6175f4"
              />
              <input
                type="color"
                value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Preset colors */}
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(c => (
            <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
              className={`w-7 h-7 rounded-full transition-all hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-[var(--text3)] scale-110' : ''}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>

        {/* Icon picker */}
        <IconPicker value={form.icon} onChange={icon => setForm(f => ({ ...f, icon }))} label="Icon" />

        {/* Nature of Spending */}
        <div>
          <label className="label">Nature of Spending</label>
          <select className="input" value={form.nature} onChange={e => setForm(f => ({ ...f, nature: e.target.value }))}>
            {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {/* Type — only for top-level */}
        {!parentData && (
          <div>
            <label className="label">Type</label>
            <div className="flex gap-2">
              {TYPES.map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all border ${
                    form.type === t
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-[var(--border)] text-[var(--text2)] hover:border-[var(--border2)]'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hide toggle */}
        <div className="flex items-center justify-between p-3 bg-[var(--bg3)] rounded-xl">
          <span className="text-sm text-[var(--text2)]">Hide this category</span>
          <button type="button" onClick={() => setForm(f => ({ ...f, isVisible: !f.isVisible }))}
            className={`w-11 h-6 rounded-full transition-colors relative ${!form.isVisible ? 'bg-primary-600' : 'bg-[var(--border2)]'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${!form.isVisible ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-colors">
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </Modal>
  );
};

// ─── Color dot ────────────────────────────────────────────────────────────────
const CatIcon = ({ icon, color, size = 36 }) => (
  <div
    className="rounded-full flex items-center justify-center shrink-0"
    style={{ width: size, height: size, backgroundColor: color }}
  >
    <LucideIcon name={icon} size={size * 0.48} className="text-white" />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Categories = () => {
  const { categories, loadCategories } = useApp();
  const [selected, setSelected] = useState(null);   // selected top-level category
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'detail'

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [parentData, setParentData] = useState(null);

  // Delete confirm
  const [delTarget, setDelTarget] = useState(null);

  const openCreate = () => { setEditData(null); setParentData(null); setFormOpen(true); };
  const openEdit   = (cat) => { setEditData(cat); setParentData(null); setFormOpen(true); };
  const openAddSub = (cat) => { setEditData(null); setParentData(cat); setFormOpen(true); };

  const handleDelete = async (cat) => {
    try {
      await categoryAPI.delete(cat._id);
      toast.success(`"${cat.name}" deleted`);
      if (selected?._id === cat._id) setSelected(null);
      await loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // When categories reload, refresh selected object
  useEffect(() => {
    if (selected) {
      const fresh = categories.find(c => c._id === selected._id);
      setSelected(fresh || null);
    }
  }, [categories]);

  const handleSelectCategory = (cat) => {
    setSelected(cat);
    setMobileView('detail');
  };

  const subcategories = selected?.children || [];

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col">

      {/* ── Desktop: two-panel / Mobile: single panel ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL — category list */}
        <div className={`
          flex flex-col border-r border-[var(--border)] bg-[var(--bg2)]
          w-full lg:w-72 xl:w-80 shrink-0
          ${mobileView === 'detail' ? 'hidden lg:flex' : 'flex'}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
            <h1 className="text-lg font-black text-[var(--text)]">Categories</h1>
            <button onClick={openCreate} className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3">
              <Plus size={14} /> New
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto py-2">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center px-6">
                <div className="w-12 h-12 bg-[var(--bg3)] rounded-2xl flex items-center justify-center mb-3">
                  <LucideIcon name="Tag" size={22} className="text-[var(--text3)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--text)]">No categories yet</p>
                <p className="text-xs text-[var(--text3)] mt-1">Click "New" to create one</p>
              </div>
            ) : (
              categories.map(cat => (
                <button key={cat._id} onClick={() => handleSelectCategory(cat)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--bg3)] ${
                    selected?._id === cat._id
                      ? 'bg-[var(--bg3)] border-r-2 border-primary-500'
                      : ''
                  }`}
                >
                  <CatIcon icon={cat.icon} color={cat.color} size={34} />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">{cat.name}</p>
                    {cat.children?.length > 0 && (
                      <p className="text-xs text-[var(--text3)]">{cat.children.length} subcategories</p>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-[var(--text3)] shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL — subcategories */}
        <div className={`
          flex-1 flex flex-col bg-[var(--bg)] overflow-hidden
          ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}
        `}>
          {!selected ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 bg-[var(--bg2)] border border-[var(--border)] rounded-2xl flex items-center justify-center mb-4">
                <LucideIcon name="LayoutGrid" size={26} className="text-[var(--text3)]" />
              </div>
              <p className="font-semibold text-[var(--text)]">Select a category</p>
              <p className="text-sm text-[var(--text2)] mt-1">Click a category on the left to see its subcategories</p>
            </div>
          ) : (
            <>
              {/* Right panel header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)] bg-[var(--bg2)] shrink-0">
                {/* Mobile back button */}
                <button onClick={() => setMobileView('list')} className="lg:hidden btn-ghost p-1.5">
                  <ArrowLeft size={18} />
                </button>
                <CatIcon icon={selected.icon} color={selected.color} size={38} />
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-black text-[var(--text)] truncate">{selected.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[var(--text3)] capitalize">{selected.type}</span>
                    {selected.nature !== 'None' && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: selected.color + '22', color: selected.color }}>
                        {selected.nature}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => openEdit(selected)}
                  className="btn-primary text-xs py-2 px-4">
                  Edit
                </button>
              </div>

              {/* Subcategory list */}
              <div className="flex-1 overflow-y-auto">
                {subcategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
                    <div className="w-12 h-12 bg-[var(--bg2)] border border-[var(--border)] rounded-2xl flex items-center justify-center mb-3">
                      <LucideIcon name="FolderPlus" size={20} className="text-[var(--text3)]" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text)]">No subcategories</p>
                    <p className="text-xs text-[var(--text3)] mt-1 mb-4">Add subcategories to organize better</p>
                    <button onClick={() => openAddSub(selected)} className="btn-primary text-xs py-2 px-4">
                      <Plus size={13} className="inline mr-1" /> Add subcategory
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {subcategories.map(sub => (
                      <div key={sub._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--bg2)] transition-colors group">
                        <CatIcon icon={sub.icon} color={sub.color} size={32} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--text)] truncate">{sub.name}</p>
                          {sub.nature !== 'None' && (
                            <span className="text-xs" style={{ color: sub.color }}>{sub.nature}</span>
                          )}
                        </div>
                        <DotMenu
                          canAddSub={false}
                          onEdit={() => openEdit(sub)}
                          onDelete={() => handleDelete(sub)}
                        />
                      </div>
                    ))}
                    {/* Add subcategory row */}
                    <button onClick={() => openAddSub(selected)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-[var(--text3)] hover:bg-[var(--bg2)] hover:text-primary-500 transition-colors">
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-[var(--border2)] flex items-center justify-center">
                        <Plus size={14} />
                      </div>
                      <span className="text-sm font-medium">Add subcategory</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Form modal */}
      <CategoryForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditData(null); setParentData(null); }}
        onSuccess={async () => {
          await loadCategories();
          // refresh selected if editing it
          if (editData && selected?._id === editData._id) {
            const fresh = categories.find(c => c._id === editData._id);
            if (fresh) setSelected(fresh);
          }
        }}
        editData={editData}
        parentData={parentData}
      />
    </div>
  );
};

export default Categories;