import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface InputDataDisplayProps {
  inputs: Record<string, any>;
}

const InputDataDisplay: React.FC<InputDataDisplayProps> = ({ inputs }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
      return `[${value.length} items]`;
    }
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    return String(value);
  };

  return (
    <div className="text-sm">
      <button
        onClick={toggleOpen}
        className="flex items-center justify-between w-full p-2 bg-gray-100 hover:bg-gray-200 rounded"
      >
        <span>Input Data</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div className="mt-2 p-2 bg-gray-50 rounded max-h-60 overflow-y-auto">
          {Object.entries(inputs).map(([key, value]) => (
            <div key={key} className="mb-1">
              <span className="font-semibold">{key}:</span>{' '}
              <span className="text-gray-700">{formatValue(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InputDataDisplay;