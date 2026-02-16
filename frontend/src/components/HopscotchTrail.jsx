import { forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import BoxTrailButton from './BoxTrailButton'
import { getBoxColorClass } from '../utils'

const HopscotchTrail = forwardRef(({ boxes, currentBox, onJumpTo, onStartOver }, ref) => {
  const navigate = useNavigate()

  // Get the color of the latest box for the summarize button
  const latestBox = boxes[boxes.length - 1]
  const summarizeColorClass = latestBox ? getBoxColorClass(latestBox.id) : 'border-white'

  return (
    <div ref={ref} className="fixed top-0 left-0 right-0 bg-black border-b border-white/20 p-3 z-50">
      <div className="flex items-center justify-between gap-4">
        {/* Box trail */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 flex-1">
          {boxes.map((box, index) => (
            <BoxTrailButton
              key={box.id}
              box={box}
              isActive={box.id === currentBox}
              onJumpTo={onJumpTo}
              showConnector={index < boxes.length - 1}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {boxes.length > 1 && (
            <button
              onClick={onStartOver}
              className="flex-shrink-0 px-4 py-2 bg-black text-white/60 text-sm font-bold hover:text-white hover:bg-white/10 transition-colors border-2 border-white/30"
            >
              start over
            </button>
          )}
          <button
            onClick={() => navigate('/summary')}
            className={`flex-shrink-0 px-4 py-2 bg-black text-white text-sm font-bold hover:bg-white/10 transition-colors border-2 ${summarizeColorClass}`}
          >
            summarize
          </button>
        </div>
      </div>
    </div>
  )
})

export default HopscotchTrail
