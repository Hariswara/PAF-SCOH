import type { ResourceResponse } from '../../types/resource';

interface ResourceTableProps {
  resources: ResourceResponse[];
  title: string;
  tableId: string;
}

export default function ResourceTable({ resources, title, tableId }: ResourceTableProps) {
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
                    <div className="flex gap-2">
                      <button className="text-xs px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors">
                        Edit
                      </button>
                      <button className="text-xs px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}