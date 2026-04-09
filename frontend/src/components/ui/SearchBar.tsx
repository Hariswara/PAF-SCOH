import { useState } from 'react';

interface SearchBarProps {
  onSearch: (params: {
    name: string;
    location: string;
    capacity: string;
  }) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder }: SearchBarProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');

  const handleSearch = () => {
    onSearch({ name, location, capacity });
  };

  const handleClear = () => {
    setName('');
    setLocation('');
    setCapacity('');
    onSearch({ name: '', location: '', capacity: '' });
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={placeholder || 'Search by name...'}
          className="flex-1 min-w-[150px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Search by location..."
          className="flex-1 min-w-[150px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          value={capacity}
          onChange={e => setCapacity(e.target.value)}
          placeholder="Capacity..."
          className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Search
        </button>
        <button
          onClick={handleClear}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}