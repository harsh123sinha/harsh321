import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function AreaManagerCard({ apiPrefix }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return toast.error('Enter an area name');
    setSaving(true);
    try {
      await api.post(`${apiPrefix}/areas`, { name: n });
      toast.success('Area added');
      setName('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add area');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
      <MapPin className="h-12 w-12 text-gold mb-4" />
      <h3 className="text-xl font-bold text-navy">Add new area</h3>
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border-2 border-gray-light px-3 py-2 text-sm focus:border-gold focus:outline-none"
          placeholder="e.g. Rajiv Nagar"
        />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1 rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </form>
    </div>
  );
}

