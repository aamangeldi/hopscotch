import { getBoxColorClass } from '../utils'

const ReferencePointSidebar = ({ referencePoints, onClickReferencePoint }) => {
  return (
    <div className="w-64 flex-shrink-0 border-2 border-white/20 bg-black" style={{ maxHeight: 'calc(100vh - 250px)' }}>
      <h3 className="text-lg font-bold p-4 pb-2 text-white/70 sticky top-0 bg-black z-10">reference points</h3>
      <div className="space-y-4 p-4 pt-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {referencePoints.length === 0 ? (
          <div className="text-sm text-white/50">No reference points yet</div>
        ) : (
          referencePoints.map((point, index) => {
            const colorClass = getBoxColorClass(point.boxId)

            return (
              <div
                key={index}
                className={`border-2 ${colorClass} bg-black cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => onClickReferencePoint(point.boxId)}
              >
                <img
                  src={point.image_url}
                  alt={point.title}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <div className="p-2">
                  <a
                    href={point.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`block w-full px-2 py-1 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border ${colorClass} text-center`}
                  >
                    go to website
                  </a>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ReferencePointSidebar
