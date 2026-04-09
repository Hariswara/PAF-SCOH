import CreateResourceForm from '@/components/ui/CreateResourceForm';

export default function CreateResourcePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Resource</h1>
        <p className="text-gray-500 mt-1">Add a new bookable resource</p>
      </div>
      <CreateResourceForm />
    </div>
  );
}