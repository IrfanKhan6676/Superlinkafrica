import FileUpload from '@/components/FileUpload';

export default function UploadPage() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload New File</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload images, documents, or other files to your storage.
        </p>
      </div>
      
      <FileUpload />
      
      <div className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900">Upload Guidelines</h3>
        <ul className="mt-2 text-sm text-gray-500 list-disc pl-5 space-y-1">
          <li>Maximum file size: 10MB</li>
          <li>Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX</li>
          <li>For security reasons, some file types may be restricted</li>
        </ul>
      </div>
    </div>
  );
}
