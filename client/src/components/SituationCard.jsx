/**
 * SituationCard — menampilkan situasi soal beserta badge bahasa & level.
 */
export default function SituationCard({ situasi, bahasa, level }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
      {/* Badge bahasa & level */}
      <div className="flex gap-2 mb-3">
        <span className="inline-block rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-700">
          {bahasa}
        </span>
        <span className="inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-700">
          {level}
        </span>
      </div>

      {/* Label */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Situasi
      </p>

      {/* Teks situasi */}
      <p className="text-base leading-relaxed text-gray-800">{situasi}</p>
    </div>
  );
}
