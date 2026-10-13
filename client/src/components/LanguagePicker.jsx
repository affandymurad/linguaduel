// Daftar 6 bahasa dengan emoji representatif
const BAHASA_LIST = [
  { kode: 'Indonesia', emoji: '🇮🇩', label: 'Indonesia' },
  { kode: 'Betawi',    emoji: '🏙️',  label: 'Betawi'    },
  { kode: 'Jawa',      emoji: '🌋',  label: 'Jawa'      },
  { kode: 'Melayu',    emoji: '⛵',  label: 'Melayu'    },
  { kode: 'Sunda',     emoji: '🌿',  label: 'Sunda'     },
  { kode: 'Minang',    emoji: '🏠',  label: 'Minang'    },
];

/**
 * @param {{ selected: string, onChange: (lang: string) => void }} props
 */
export default function LanguagePicker({ selected, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {BAHASA_LIST.map((b) => (
        <button
          key={b.kode}
          onClick={() => onChange(b.kode)}
          className={[
            'flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-3 text-sm font-medium transition-all',
            selected === b.kode
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50',
          ].join(' ')}
        >
          <span className="text-2xl">{b.emoji}</span>
          <span>{b.label}</span>
        </button>
      ))}
    </div>
  );
}
