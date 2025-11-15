import { getBoxColorClass } from '../utils'

const BoxTrailButton = ({ box, isActive, onJumpTo, showConnector }) => {
  const colorClass = getBoxColorClass(box.id)

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <button
        onClick={() => onJumpTo(box.id)}
        className={`
          ${colorClass}
          ${isActive ? 'scale-95' : 'hover:scale-90'}
          cursor-pointer
          w-12 h-12
          flex items-center justify-center
          text-lg font-bold text-white
          transform transition-all duration-200
          border-2 bg-black
        `}
      >
        {box.id}
      </button>
      {showConnector && (
        <div className={`w-3 h-0.5 ${colorClass}`}></div>
      )}
    </div>
  )
}

export default BoxTrailButton
