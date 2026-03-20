import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { categoryAPI, tagAPI } from '../services/api';
import { COLORS, CATEGORY_ICONS, NATURE_TYPES } from '../utils/helpers';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, User, Bell, Shield, Palette, Tag as TagIcon, Layers } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'tags', label: 'Tags', icon: TagIcon },
  { id: 'security', label: 'Security', icon: Shield },
];

function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name||'', currency: user?.currency||'BDT', timezone: user?.timezone||'Asia/Dhaka' });
  const save = () => updateUser(form).catch(e => toast.error(e.message));
  return (
    <div className="space-y-5 max-w-md">
      <div><label className="label">Full Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="input" /></div>
      <div><label className="label">Email</label><input value={user?.email} disabled className="input opacity-50 cursor-not-allowed" /></div>
      <div><label className="label">Currency</label>
        <select value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))} className="input">
          <option value="BDT">৳ BDT - Bangladeshi Taka</option>
          <option value="USD">$ USD - US Dollar</option>
          <option value="EUR">€ EUR - Euro</option>
          <option value="GBP">£ GBP - British Pound</option>
          <option value="INR">₹ INR - Indian Rupee</option>
        </select>
      </div>
      <button onClick={save} className="btn-primary">Save Changes</button>
    </div>
  );
}

function CategorySettings() {
  const { categories, fetchCategories } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name:'', color:'#6366f1', icon:'📁', nature:'None', type:'expense', parent:'' });

  const allCats = [];
  const flatten = (cats, d=0) => cats.forEach(c => { allCats.push({...c,d}); if(c.children) flatten(c.children,d+1); });
  flatten(categories);

  const openAdd = (parent = null) => {
    setEditCat(null);
    setForm({ name:'', color: parent?.color || '#6366f1', icon:'📁', nature:'None', type:'expense', parent: parent?._id || '' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ name:cat.name, color:cat.color, icon:cat.icon, nature:cat.nature, type:cat.type, parent:cat.parent||'' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return toast.error('Name required');
    try {
      if (editCat) { await categoryAPI.update(editCat._id, form); toast.success('Updated'); }
      else { await categoryAPI.create(form); toast.success('Created'); }
      await fetchCategories(); setShowModal(false);
    } catch (e) { toast.error(e.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hide this category?')) return;
    await categoryAPI.delete(id); await fetchCategories(); toast.success('Category hidden');
  };

  const renderCats = (cats, depth=0) => cats.map(cat => (
    <div key={cat._id}>
      <div className={`flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 group transition-colors`} style={{ paddingLeft: `${12 + depth * 20}px` }}>
        <span className="text-xl w-7 text-center">{cat.icon}</span>
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
        <p className="flex-1 text-sm font-medium text-surface-700 dark:text-surface-300">{cat.name}</p>
        <span className="text-xs text-surface-400 bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded-full">{cat.nature}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {depth < 2 && <button onClick={() => openAdd(cat)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-500"><Plus size={12} /></button>}
          <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-400"><Edit2 size={12} /></button>
          <button onClick={() => handleDelete(cat._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={12} /></button>
        </div>
      </div>
      {cat.children?.length > 0 && renderCats(cat.children, depth+1)}
    </div>
  ));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-surface-400">{allCats.length} categories</p>
        <button onClick={() => openAdd()} className="btn-primary text-xs py-2"><Plus size={13} /> Add Category</button>
      </div>
      <div className="card divide-y divide-surface-50 dark:divide-surface-800">
        {renderCats(categories)}
        {categories.length === 0 && <p className="text-center text-surface-400 text-sm py-8">No categories. Add your first one!</p>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCat ? 'Edit Category' : 'New Category'} size="sm"
        footer={<div className="flex gap-3"><button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button><button onClick={handleSave} className="btn-primary flex-1 justify-center">Save</button></div>}>
        <div className="space-y-4">
          <div><label className="label">Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="input" placeholder="Category name" /></div>
          <div><label className="label">Icon</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-thin">
              {CATEGORY_ICONS.map(icon => (
                <button key={icon} onClick={() => setForm(f=>({...f,icon}))}
                  className={`w-9 h-9 rounded-lg text-xl transition-all ${form.icon === icon ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500' : 'hover:bg-surface-100 dark:hover:bg-surface-800'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div><label className="label">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => <button key={c} onClick={() => setForm(f=>({...f,color:c}))} className={`w-8 h-8 rounded-lg ${form.color===c?'ring-2 ring-offset-2 ring-primary-500 scale-110':''}`} style={{backgroundColor:c}} />)}
            </div>
          </div>
          <div><label className="label">Nature</label>
            <div className="flex gap-2">
              {NATURE_TYPES.map(n => <button key={n} onClick={() => setForm(f=>({...f,nature:n}))} className={`flex-1 py-2 rounded-xl text-xs font-semibold ${form.nature===n?'bg-primary-600 text-white':'bg-surface-100 dark:bg-surface-900 text-surface-500'}`}>{n}</button>)}
            </div>
          </div>
          <div><label className="label">Type</label>
            <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="input">
              <option value="expense">Expense</option><option value="income">Income</option><option value="both">Both</option>
            </select>
          </div>
          {!editCat && <div><label className="label">Parent (optional)</label>
            <select value={form.parent} onChange={e=>setForm(f=>({...f,parent:e.target.value}))} className="input">
              <option value="">Top level</option>
              {allCats.filter(c=>c.d<2).map(c=><option key={c._id} value={c._id}>{' '.repeat(c.d*2)}{c.icon} {c.name}</option>)}
            </select>
          </div>}
        </div>
      </Modal>
    </div>
  );
}

function TagSettings() {
  const { tags, fetchTags } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editTag, setEditTag] = useState(null);
  const [form, setForm] = useState({ name:'', color:'#10b981', autoAssign:false });

  const handleSave = async () => {
    if (!form.name) return toast.error('Name required');
    try {
      if (editTag) { await tagAPI.update(editTag._id, form); toast.success('Updated'); }
      else { await tagAPI.create(form); toast.success('Tag created'); }
      await fetchTags(); setShowModal(false);
    } catch (e) { toast.error(e.message || 'Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-surface-400">{tags.length} tags</p>
        <button onClick={() => { setEditTag(null); setForm({ name:'', color:'#10b981', autoAssign:false }); setShowModal(true); }} className="btn-primary text-xs py-2"><Plus size={13} /> Add Tag</button>
      </div>
      <div className="flex flex-wrap gap-3">
        {tags.map(tag => (
          <div key={tag._id} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{tag.name}</span>
            {tag.autoAssign && <span className="text-[10px] font-semibold text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-1.5 py-0.5 rounded-full">auto</span>}
            <button onClick={() => { setEditTag(tag); setForm({...tag}); setShowModal(true); }} className="text-surface-400 hover:text-primary-600 ml-1"><Edit2 size={11} /></button>
            <button onClick={async () => { await tagAPI.delete(tag._id); fetchTags(); }} className="text-surface-400 hover:text-red-500"><Trash2 size={11} /></button>
          </div>
        ))}
        {tags.length === 0 && <p className="text-sm text-surface-400">No tags yet.</p>}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTag ? 'Edit Tag' : 'New Tag'} size="sm"
        footer={<div className="flex gap-3"><button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button><button onClick={handleSave} className="btn-primary flex-1 justify-center">Save</button></div>}>
        <div className="space-y-4">
          <div><label className="label">Tag Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="input" /></div>
          <div><label className="label">Color</label><div className="flex flex-wrap gap-2">{COLORS.map(c => <button key={c} onClick={() => setForm(f=>({...f,color:c}))} className={`w-8 h-8 rounded-lg ${form.color===c?'ring-2 ring-offset-2 ring-primary-500 scale-110':''}`} style={{backgroundColor:c}} />)}</div></div>
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.autoAssign} onChange={e=>setForm(f=>({...f,autoAssign:e.target.checked}))} className="w-4 h-4 rounded accent-primary-600" /><span className="text-sm text-surface-700 dark:text-surface-300">Auto-assign to transactions</span></label>
        </div>
      </Modal>
    </div>
  );
}

function SecuritySettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const { changePassword } = useAuth();
  const handleChange = async () => {
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    try { await changePassword?.(form.currentPassword, form.newPassword); toast.success('Password changed'); setForm({currentPassword:'',newPassword:'',confirmPassword:''}); }
    catch (e) { toast.error(e.message || 'Failed'); }
  };
  return (
    <div className="space-y-5 max-w-md">
      <div className="card p-4"><p className="text-sm text-surface-500 dark:text-surface-400">Role: <span className="font-semibold text-surface-800 dark:text-surface-200 capitalize">{user?.role}</span></p><p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Last login: <span className="font-semibold text-surface-800 dark:text-surface-200">{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</span></p></div>
      <h3 className="font-semibold text-surface-800 dark:text-surface-200">Change Password</h3>
      <div><label className="label">Current Password</label><input type="password" value={form.currentPassword} onChange={e=>setForm(f=>({...f,currentPassword:e.target.value}))} className="input" /></div>
      <div><label className="label">New Password</label><input type="password" value={form.newPassword} onChange={e=>setForm(f=>({...f,newPassword:e.target.value}))} className="input" /></div>
      <div><label className="label">Confirm New Password</label><input type="password" value={form.confirmPassword} onChange={e=>setForm(f=>({...f,confirmPassword:e.target.value}))} className="input" /></div>
      <button onClick={handleChange} className="btn-primary">Update Password</button>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const CONTENT = { profile: ProfileSettings, categories: CategorySettings, tags: TagSettings, security: SecuritySettings };
  const Content = CONTENT[activeTab];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Settings</h1>
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="sm:w-48 shrink-0">
          <nav className="space-y-1">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${activeTab === t.id ? 'bg-primary-600 text-white' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'}`}>
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex-1 min-w-0">
          <div className="card p-6"><Content /></div>
        </div>
      </div>
    </div>
  );
}
