import { forwardRef } from 'react'
import { BOX_COLORS } from '../constants'

const HopscotchTrail = forwardRef(({ boxes, currentBox, onJumpTo }, ref) => {
  return (
    <div ref={ref} className="fixed top-0 left-0 right-0 bg-black border-b border-white/20 p-3 z-50">
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {boxes.map((box, index) => {
          const colorClass = BOX_COLORS[index % BOX_COLORS.length]
          const isActive = box.id === currentBox

          return (
            <div key={box.id} className="flex items-center gap-1.5 flex-shrink-0">
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
              {index < boxes.length - 1 && (
                <div className={`w-3 h-0.5 ${BOX_COLORS[index % BOX_COLORS.length]}`}></div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})

export default HopscotchTrail
