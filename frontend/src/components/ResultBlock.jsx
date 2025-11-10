import { SIMILAR_BUTTON_COLOR, DIFFERENT_BUTTON_COLOR } from '../constants'

const ResultBlock = ({ result, onFeedback, isLatest, isLoading }) => {
  return (
    <div className="w-full h-full flex flex-col bg-black relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <div className="text-white text-sm font-bold">updating...</div>
          </div>
        </div>
      )}

      {/* Image */}
      <div className="flex-1 overflow-hidden border-b-2 border-white/20">
        <img
          src={result.image_url}
          alt={result.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400'
          }}
        />
      </div>

      {/* Content */}
      <div className={`p-4 flex flex-col justify-between ${!isLatest ? 'opacity-30' : ''}`}>
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{result.title}</h3>
          <p className="text-white/60 text-xs line-clamp-2">{result.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onFeedback('similar')}
            disabled={!isLatest}
            className={`flex-1 px-3 py-2 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border ${SIMILAR_BUTTON_COLOR} disabled:cursor-not-allowed disabled:hover:bg-black`}
            title="Similar"
          >
            similar
          </button>
          <button
            onClick={() => onFeedback('different')}
            disabled={!isLatest}
            className={`flex-1 px-3 py-2 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border ${DIFFERENT_BUTTON_COLOR} disabled:cursor-not-allowed disabled:hover:bg-black`}
            title="Different"
          >
            different
          </button>
          <a
            href={isLatest ? result.url : undefined}
            target={isLatest ? "_blank" : undefined}
            rel={isLatest ? "noopener noreferrer" : undefined}
            onClick={(e) => !isLatest && e.preventDefault()}
            className={`flex-1 px-3 py-2 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border border-white/30 text-center ${!isLatest ? 'cursor-not-allowed hover:bg-black' : ''}`}
            title="Visit"
          >
            go to website
          </a>
        </div>
      </div>
    </div>
  )
}

export default ResultBlock
