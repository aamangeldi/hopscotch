const InspirationButtons = ({ onInspire, disabled, colorClass }) => {
  return (
    <div className="grid grid-cols-4 gap-1">
      <button
        onClick={() => onInspire(0)}
        disabled={disabled}
        className={`px-2 py-1 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border-2 ${colorClass} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        box1
      </button>
      <button
        onClick={() => onInspire(1)}
        disabled={disabled}
        className={`px-2 py-1 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border-2 ${colorClass} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        box2
      </button>
      <button
        onClick={() => onInspire(2)}
        disabled={disabled}
        className={`px-2 py-1 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border-2 ${colorClass} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        box3
      </button>
      <button
        onClick={() => onInspire('generic')}
        disabled={disabled}
        className={`px-2 py-1 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border-2 ${colorClass} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        generic
      </button>
    </div>
  )
}

export default InspirationButtons
