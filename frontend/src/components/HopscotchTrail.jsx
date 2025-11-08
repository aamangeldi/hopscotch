const HopscotchTrail = ({ boxes, currentBox, onJumpTo }) => {
  const colors = ['border-retro-pink', 'border-retro-blue', 'border-retro-orange', 'border-retro-purple', 'border-retro-green', 'border-retro-yellow']

  return (
    <div className="fixed top-0 left-0 right-0 bg-black border-b border-white/20 p-4 z-50">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {boxes.map((box, index) => {
          const colorClass = colors[index % colors.length]
          const isActive = box.id === currentBox
          const canJump = box.id < currentBox || box.id === currentBox

          return (
            <div key={box.id} className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => canJump && onJumpTo(box.id)}
                disabled={!canJump}
                className={`
                  ${colorClass}
                  ${isActive ? 'scale-110' : 'hover:scale-105'}
                  ${!canJump ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                  w-16 h-16 rounded-lg
                  flex items-center justify-center
                  text-2xl font-bold text-white
                  transform transition-all duration-200
                  border-2 bg-black
                `}
              >
                {box.id}
              </button>
              {index < boxes.length - 1 && (
                <div className={`w-4 h-0.5 ${colors[index % colors.length]}`}></div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HopscotchTrail
