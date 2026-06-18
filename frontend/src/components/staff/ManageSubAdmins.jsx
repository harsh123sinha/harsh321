import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Pencil, Trash2, UserPlus, X } from 'lucide-react';

const empty = { name: '', email: '', password: '' };

export default function ManageSubAdmins() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/subadmins');
      setList(data.subAdmins || []);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to load sub-admins');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
    setForm(empty);
  };

  const openAdd = () => {
    setForm(empty);
    setEditingId(null);
    setModal('add');
  };

  const openEdit = (s) => {
    setForm({ name: s.name || '', email: s.email || '', password: '' });
    setEditingId(s.id);
    setModal('edit');
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'add') {
        await api.post('/admin/subadmins', form);
        toast.success('Sub-admin created');
      } else {
        const body = { name: form.name, email: form.email };
        if (form.password?.trim()) body.password = form.password;
        await api.put(`/admin/subadmins/${editingId}`, body);
        toast.success('Sub-admin updated');
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/subadmins/${deleteId}`);
      toast.success('Sub-admin deleted');
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-navy">Manage sub-admins</h1>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-gold text-navy px-4 py-2 rounded-lg font-semibold hover:bg-gold/90"
        >
          <UserPlus className="h-5 w-5" />
          Add sub-admin
        </button>
      </div>

      {loading ? (
        <p className="text-gray">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-navy text-white text-left">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-t border-gray-light hover:bg-gray-50">
                  <td className="px-4 py-3">{s.id}</td>
                  <td className="px-4 py-3 font-medium text-navy">{s.name}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="p-2 text-navy hover:bg-gold/20 rounded"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(s.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="p-6 text-gray text-center">No sub-admins yet.</p>}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-navy">{modal === 'add' ? 'Add sub-admin' : 'Edit sub-admin'}</h2>
              <button type="button" onClick={closeModal} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Name *</label>
                <input
                  className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Email *</label>
                <input
                  type="email"
                  className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">
                  {modal === 'add' ? 'Password *' : 'New password (optional)'}
                </label>
                <input
                  type="password"
                  className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={modal === 'add'}
                  autoComplete="new-password"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-gold text-navy py-2 rounded-lg font-bold">
                  Save
                </button>
                <button type="button" onClick={closeModal} className="flex-1 border-2 border-gray-light py-2 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <p className="text-navy mb-4">Remove this sub-admin? They will no longer be able to sign in.</p>
            <div className="flex gap-2">
              <button type="button" onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold">
                Delete
              </button>
              <button type="button" onClick={() => setDeleteId(null)} className="flex-1 border-2 border-gray-light py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
