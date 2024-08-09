import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';

interface FileUploadInputProps {
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({ onUpload }) => {
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onUpload(e);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        onUpload({ currentTarget: { files: dataTransfer.files } } as ChangeEvent<HTMLInputElement>);
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div
        className="relative"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileChange}
        />
        <label
          htmlFor="file-upload"
          className="
            px-4  h-12 bg-blue-500 text-white rounded-md
            font-medium cursor-pointer shadow-md
            transition-all duration-300 ease-in-out
            hover:bg-blue-600 focus:outline-none focus:ring-2
            focus:ring-offset-2 focus:ring-blue-500
            flex items-center justify-center
          "
        >
          {fileName || 'Upload File'}
        </label>
      </div>
      {fileName && (
        <span className="text-sm text-gray-600">
          {fileName}
        </span>
      )}
    </div>
  );
};

export default FileUploadInput;