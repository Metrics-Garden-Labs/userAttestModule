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
          className="btn btn-primary px-6 py-1 mt-2 bg-[#424242] cursor-pointer text-white font-thin rounded-md hover:bg-black"
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