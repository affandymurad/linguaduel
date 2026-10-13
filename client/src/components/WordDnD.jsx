import { useState, useId } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * WordDnD — Mode Susun Kalimat.
 *
 * Props:
 *   kata: string[]              — kata-kata acak yang perlu disusun
 *   onSubmit(jawaban: string)   — dipanggil saat pemain menekan Periksa
 *   disabled: boolean           — kunci setelah dijawab
 *
 * Cara kerja:
 *   - "Bank Kata" berisi kata-kata yang belum ditempatkan
 *   - "Area Jawaban" berisi kata-kata yang sudah ditempatkan (bisa diurutkan)
 *   - Tap/klik kata di Bank → pindah ke Area Jawaban
 *   - Tap/klik kata di Area → kembali ke Bank Kata
 *   - Drag juga bisa dipakai (touch + pointer sensor dnd-kit)
 */
export default function WordDnD({ kata = [], onSubmit, disabled = false }) {
  const dndId = useId();

  // bank: kata yang belum dipakai; area: kata yang sudah disusun (dengan id unik)
  const [bank, setBank]   = useState(() => kata.map((k, i) => ({ id: `w-${i}`, teks: k })));
  const [area, setArea]   = useState([]);
  const [activeItem, setActiveItem] = useState(null); // untuk DragOverlay

  // Sensor dengan threshold kecil agar tap mobile tidak langsung trigger drag
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  // ── Tap / klik: pindahkan kata tanpa drag ────────────────────────────────
  function tapBank(item) {
    if (disabled) return;
    setBank(prev => prev.filter(w => w.id !== item.id));
    setArea(prev => [...prev, item]);
  }

  function tapArea(item) {
    if (disabled) return;
    setArea(prev => prev.filter(w => w.id !== item.id));
    setBank(prev => [...prev, item]);
  }

  // ── dnd-kit drag handlers ─────────────────────────────────────────────────
  function onDragStart({ active }) {
    const fromArea = area.find(w => w.id === active.id);
    const fromBank = bank.find(w => w.id === active.id);
    setActiveItem(fromArea || fromBank || null);
  }

  function onDragEnd({ active, over }) {
    setActiveItem(null);
    if (!over) return;

    const fromArea = area.some(w => w.id === active.id);
    const fromBank = bank.some(w => w.id === active.id);
    const toArea   = over.id === `drop-${dndId}` || area.some(w => w.id === over.id);
    const toBank   = over.id === `bank-${dndId}` || bank.some(w => w.id === over.id);

    if (fromArea && toArea) {
      // Reorder dalam area
      const oldIdx = area.findIndex(w => w.id === active.id);
      const newIdx = area.findIndex(w => w.id === over.id);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        setArea(prev => arrayMove(prev, oldIdx, newIdx));
      }
    } else if (fromBank && toArea) {
      // Bank → Area
      const item = bank.find(w => w.id === active.id);
      setBank(prev => prev.filter(w => w.id !== active.id));
      setArea(prev => {
        const insertIdx = area.findIndex(w => w.id === over.id);
        if (insertIdx === -1) return [...prev, item];
        const copy = [...prev];
        copy.splice(insertIdx, 0, item);
        return copy;
      });
    } else if (fromArea && toBank) {
      // Area → Bank
      const item = area.find(w => w.id === active.id);
      setArea(prev => prev.filter(w => w.id !== active.id));
      setBank(prev => [...prev, item]);
    }
  }

  function handlePeriksa() {
    if (area.length === 0) return;
    onSubmit(area.map(w => w.teks).join(' '));
  }

  function handleReset() {
    setArea([]);
    setBank(kata.map((k, i) => ({ id: `w-${i}`, teks: k })));
  }

  const jawabanTeks = area.map(w => w.teks).join(' ');

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="space-y-4">

        {/* ── Area Jawaban ─────────────────────────────────────────────────── */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Area Jawaban
          </p>
          <SortableContext
            items={area.map(w => w.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div
              id={`drop-${dndId}`}
              className={[
                'min-h-[56px] rounded-2xl border-2 border-dashed px-3 py-2',
                'flex flex-wrap gap-2 items-center',
                area.length === 0
                  ? 'border-indigo-200 bg-indigo-50'
                  : 'border-indigo-300 bg-white',
                disabled ? 'opacity-60' : '',
              ].join(' ')}
            >
              {area.length === 0 && (
                <p className="text-xs text-indigo-400 select-none w-full text-center py-1">
                  Ketuk kata di bawah atau seret ke sini
                </p>
              )}
              {area.map(item => (
                <SortableWord
                  key={item.id}
                  item={item}
                  onTap={tapArea}
                  disabled={disabled}
                  inArea
                />
              ))}
            </div>
          </SortableContext>
        </div>

        {/* ── Bank Kata ────────────────────────────────────────────────────── */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Bank Kata
          </p>
          <div
            id={`bank-${dndId}`}
            className={[
              'min-h-[48px] rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2',
              'flex flex-wrap gap-2 items-center',
            ].join(' ')}
          >
            {bank.length === 0 && (
              <p className="text-xs text-gray-400 select-none w-full text-center py-1">
                Semua kata sudah dipakai ✓
              </p>
            )}
            {bank.map(item => (
              <WordChip
                key={item.id}
                item={item}
                onTap={tapBank}
                disabled={disabled}
                inArea={false}
              />
            ))}
          </div>
        </div>

        {/* ── Pratinjau kalimat ────────────────────────────────────────────── */}
        {jawabanTeks && (
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-2">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-0.5">Pratinjau</p>
            <p className="text-sm font-medium text-indigo-800">{jawabanTeks}</p>
          </div>
        )}

        {/* ── Tombol aksi ───────────────────────────────────────────────────── */}
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={disabled || (area.length === 0)}
            className="flex-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-500 hover:border-red-300 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handlePeriksa}
            disabled={disabled || area.length === 0}
            className={[
              'flex-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-colors',
              disabled || area.length === 0
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800',
            ].join(' ')}
          >
            Periksa →
          </button>
        </div>
      </div>

      {/* DragOverlay: kata yang sedang ditarik */}
      <DragOverlay>
        {activeItem && (
          <span className="inline-block rounded-xl bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-lg select-none">
            {activeItem.teks}
          </span>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ---------------------------------------------------------------------------
// SortableWord — kata di dalam area jawaban (bisa diurutkan)
// ---------------------------------------------------------------------------
function SortableWord({ item, onTap, disabled, inArea }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <span
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => !isDragging && onTap(item)}
      onKeyDown={(e) => {
        if (!disabled && !isDragging && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onTap(item);
        }
      }}
      className={[
        'inline-block cursor-pointer select-none rounded-xl px-3 py-1.5 text-sm font-semibold touch-none',
        'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-95',
        'transition-transform duration-100 focus:outline-none focus:ring-2 focus:ring-indigo-300',
        disabled ? 'cursor-default opacity-60' : '',
      ].join(' ')}
    >
      {item.teks}
    </span>
  );
}

// ---------------------------------------------------------------------------
// WordChip — kata di bank kata (tidak bisa diurutkan di dalam bank)
// ---------------------------------------------------------------------------
function WordChip({ item, onTap, disabled }) {
  return (
    <button
      onClick={() => onTap(item)}
      disabled={disabled}
      className={[
        'inline-block rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium',
        'text-gray-700 shadow-sm hover:border-indigo-400 hover:text-indigo-700',
        'active:scale-95 transition-transform duration-100 select-none',
        disabled ? 'cursor-default opacity-50' : 'cursor-pointer',
      ].join(' ')}
    >
      {item.teks}
    </button>
  );
}
