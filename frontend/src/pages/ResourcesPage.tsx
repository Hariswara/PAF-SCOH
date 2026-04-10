import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResources } from '../api/resourceApi';
import type { ResourceResponse } from '../types/resource';
import ResourceTable from '../components/ui/ResourceTable';
import SearchBar from '../components/ui/SearchBar';

const TABS = [
  { label: 'Lecture Halls', type: 'LECTURE_HALL', id: 'lecture-halls' },
  { label: 'Labs', type: 'LAB', id: 'labs' },
  { label: 'Meeting Rooms', type: 'MEETING_ROOM', id: 'meeting-rooms' },
  { label: 'Equipment', type: 'EQUIPMENT', id: 'equipment' },
];

export default function ResourcesPage() {
  const navigate = useNavigate();
  const [filteredResources, setFilteredResources] = useState<ResourceResponse[]>([]);
  const [tableFilters, setTableFilters] = useState<Record<string, ResourceResponse[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getResources();
      setFilteredResources(data);
      const initial: Record<string, ResourceResponse[]> = {};
      TABS.forEach(tab => {
        initial[tab.type] = data.filter(r => r.type === tab.type);
      });
      setTableFilters(initial);
    } catch {
      setError('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleGlobalSearch = async (params: {
    name: string;
    location: string;
    capacity: string;
  }) => {
    try {
      const data = await getResources({
        name: params.name || undefined,
        location: params.location || undefined,
        capacity: params.capacity ? Number(params.capacity) : undefined,
      });
      setFilteredResources(data);
      const updated: Record<string, ResourceResponse[]> = {};
      TABS.forEach(tab => {
        updated[tab.type] = data.filter(r => r.type === tab.type);
      });
      setTableFilters(updated);
    } catch {
      setError('Search failed.');
    }
  };

  const handleTableSearch = async (
    type: string,
    params: { name: string; location: string; capacity: string }
  ) => {
    try {
      const data = await getResources({
        type,
        name: params.name || undefined,
        location: params.location || undefined,
        capacity: params.capacity ? Number(params.capacity) : undefined,
      });
      setTableFilters(prev => ({ ...prev, [type]: data }));
    } catch {
      setError('Search failed.');
    }
  };

  const handleResourceUpdated = (updated: ResourceResponse) => {
    setTableFilters(prev => {
      const newFilters = { ...prev };
      TABS.forEach(tab => {
        if (newFilters[tab.type]) {
          newFilters[tab.type] = newFilters[tab.type].map(r =>
            r.id === updated.id ? updated : r
          );
        }
      });
      return newFilters;
    });
  };

  const handleResourceDeleted = (id: string) => {
    setTableFilters(prev => {
      const newFilters = { ...prev };
      TABS.forEach(tab => {
       if (newFilters[tab.type]) {
        newFilters[tab.type] = newFilters[tab.type].filter(r => r.id !== id);
       }
      });
      return newFilters;
    });
  };

  const scrollToTable = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facilities & Assets</h1>
            <p className="text-gray-500 mt-1">Manage all campus resources</p>
          </div>
          <button
            onClick={() => navigate('/resources/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Create Resource
          </button>
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.type}
              onClick={() => scrollToTable(tab.id)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-sm"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Search */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-600 mb-2">
            🔍 Global Search — search across all resource types
          </p>
          <SearchBar
            onSearch={handleGlobalSearch}
            placeholder="Search all resources by name..."
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-lg">
            Loading resources...
          </div>
        ) : (
          <>
            {TABS.map(tab => (
              <div key={tab.type}>
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">
                    Search within {tab.label}
                  </p>
                  <SearchBar
                    onSearch={params => handleTableSearch(tab.type, params)}
                    placeholder={`Search ${tab.label} by name...`}
                  />
                </div>
                <ResourceTable
                  tableId={tab.id}
                  title={tab.label}
                  resources={tableFilters[tab.type] ?? []}
                  onResourceUpdated={handleResourceUpdated}
                  onResourceDeleted={handleResourceDeleted}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}