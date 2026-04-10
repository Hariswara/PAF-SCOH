import { useState } from 'react';
import type { ResourceResponse } from '../../types/resource';
import EditResourceModal from './EditResourceModal';
import { deleteResource } from '../../api/resourceApi';

interface ResourceTableProps {
  resources: ResourceResponse[];
  title: string;
  tableId: string;
  onResourceUpdated: (updated: ResourceResponse) => void;
  onResourceDeleted: (id: string) => void;        // ← ADD THIS
}

export default function ResourceTable({
  resources,
  title,
  tableId,
  onResourceUpdated,
  onResourceDeleted,
}: ResourceTableProps) {
  const [editingResource, setEditingResource] =
    useState<ResourceResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteResource(id);
      onResourceDeleted(id);
    } catch {
      alert('Failed to delete resource.');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <div id={tableId} className="mb-10">
      <h2 className="text-xl font-bold text-gray-800 mb-3">{title}</h2>

      {resources.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
          No {title.toLowerCase()} found.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Capacity</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Availability</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resources.map(resource => (
                <tr key={resource.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {resource.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {resource.capacity ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {resource.location}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {resource.availabilityWindows || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      resource.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {resource.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => setEditingResource(resource)}
                        className="text-xs px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                      >
                        Edit
                      </button>

                      {confirmId === resource.id ? (
                        // Confirmation buttons
                        <div className="flex gap-1 items-center">
                          <span className="text-xs text-gray-500">Sure?</span>
                          <button
                            onClick={() => handleDelete(resource.id)}
                            disabled={deletingId === resource.id}
                            className="text-xs px-2 py-1 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {deletingId === resource.id ? '...' : 'Yes'}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(resource.id)}
                          className="text-xs px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingResource && (
        <EditResourceModal
          resource={editingResource}
          onClose={() => setEditingResource(null)}
          onSaved={updated => {
            onResourceUpdated(updated);
            setEditingResource(null);
          }}
        />
      )}
    </div>
  );
}