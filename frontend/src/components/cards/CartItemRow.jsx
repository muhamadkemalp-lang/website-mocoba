import React, { useState } from 'react';
import { Minus, Plus, Trash2, Tag, Edit3 } from 'lucide-react';

export default function CartItemRow({ item, onUpdateQuantity, onRemoveItem, onUpdateNote }) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(item.note || '');

  const itemTotal = (item.customPrice ?? item.product.harga) * item.quantity;

  const handleSaveNote = () => {
    onUpdateNote(item.product.id, noteText.trim());
    setIsEditingNote(false);
  };

  return (
    <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 text-sm truncate">{item.product.nama}</h4>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
            <span>Rp{Number(item.product.harga).toLocaleString("id-ID")}</span>
            <span>•</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
              {item.product.id?.slice(-6) || "-"}
            </span>
          </div>

          {/* Attached Note Display */}
          {item.note && !isEditingNote && (
            <div
              onClick={() => setIsEditingNote(true)}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-md cursor-pointer hover:bg-amber-100 transition-colors"
            >
              <Tag className="w-3 h-3 text-amber-600" />
              <span className="truncate max-w-[160px]">Note: {item.note}</span>
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <span className="font-bold text-sm text-slate-900">Rp{itemTotal.toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Quantity & Actions Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.product.id, -1)}
            className="w-7 h-7 rounded-md bg-white text-slate-700 hover:bg-slate-200 hover:text-slate-900 flex items-center justify-center shadow-xs transition-colors active:scale-95"
            title="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center font-bold text-xs text-slate-800 font-mono">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.product.id, 1)}
            className="w-7 h-7 rounded-md bg-white text-slate-700 hover:bg-slate-200 hover:text-slate-900 flex items-center justify-center shadow-xs transition-colors active:scale-95"
            title="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setNoteText(item.note || '');
              setIsEditingNote(!isEditingNote);
            }}
            className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
              item.note || isEditingNote
                ? 'bg-amber-100 text-amber-800'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
            title="Add modifier note"
          >
            <Edit3 className="w-3 h-3" />
            <span>{item.note ? 'Edit Note' : '+ Note'}</span>
          </button>

          <button
            type="button"
            onClick={() => onRemoveItem(item.product.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove from cart"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline Note Editor */}
      {isEditingNote && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="e.g. Oat milk, Extra hot, No sugar"
            className="flex-1 px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveNote();
              if (e.key === 'Escape') setIsEditingNote(false);
            }}
          />
          <button
            type="button"
            onClick={handleSaveNote}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-md"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
