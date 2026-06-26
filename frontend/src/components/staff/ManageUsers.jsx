import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Pencil, Trash2, UserPlus, X } from 'lucide-react';
import BrandLoader from '../ui/BrandLoader';

const emptyUser = { name: '', email: '', password: '', role: 'buyer', phone_number: '' };

export default function ManageUsers({ variant }) {
  const prefix = variant === 'admin' ? '/admin' : '/subadmin';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`${prefix}/users`);
      setUsers(data.users || []);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to load users');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [prefix]);

  const openAdd = () => {
    setForm(emptyUser);
    setEditingId(null);
    setModal('add');
  };

  const openEdit = (u) => {
    setForm({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'buyer',
      phone_number: u.phone_number || ''
    });
    setEditingId(u.id);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
    setForm(emptyUser);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'add') {
        await api.post(`${prefix}/users`, {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          phone_number: form.phone_number || undefined
        });
        toast.success('User created');
      } else {
        const body = {
          name: form.name,
          email: form.email,
          role: form.role,
          phone_number: form.phone_number || null
        };
        if (form.password?.trim()) {
          body.password = form.password;
        }
        await api.put(`${prefix}/users/${editingId}`, body);
        toast.success('User updated');
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
      await api.delete(`${prefix}/users/${deleteId}`);
      toast.success('User deleted');
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-navy">Manage users</h1>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-gold text-navy px-4 py-2 rounded-lg font-semibold hover:bg-gold/90"
        >
          <UserPlus className="h-5 w-5" />
          Add user
        </button>
      </div>

      {loading ? (
        <BrandLoader size="sm" />
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-navy text-white text-left">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3 w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-light hover:bg-gray-50">
                  <td className="px-4 py-3">{u.id}</td>
                  <td className="px-4 py-3 font-medium text-navy">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">{u.phone_number || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        className="p-2 text-navy hover:bg-gold/20 rounded"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(u.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="p-6 text-gray text-center">No users yet.</p>}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-navy">{modal === 'add' ? 'Add user' : 'Edit user'}</h2>
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
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Role *</label>
                <select
                  className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="owner">Owner</option>
                  <option value="agent">Agent</option>
                  <option value="buyer">Buyer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Phone (10 digits)</label>
                <input
                  className="w-full border-2 border-gray-light rounded-lg px-3 py-2"
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  maxLength={10}
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
            <p className="text-navy mb-4">Delete this user? Their listings are removed (admin flow).</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 border-2 border-gray-light py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
