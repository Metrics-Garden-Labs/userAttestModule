import React from 'react';

interface SimpleDialogProps {
  trigger: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export function SimpleDialog({ title, children, trigger }: SimpleDialogProps) {
  const dialogId = `modal-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div>
      <label htmlFor={dialogId} className="cursor-pointer">
        {trigger}
      </label>
      <input type="checkbox" id={dialogId} className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative">
          <label htmlFor={dialogId} className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
          <h3 className="text-lg font-bold">{title}</h3>
          <div className="py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
