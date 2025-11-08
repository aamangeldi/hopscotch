const ResultBlock = ({ result, onFeedback }) => {
  return (
    <div className="w-full h-full flex flex-col bg-black">
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
      <div className="p-4 flex flex-col justify-between">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{result.title}</h3>
          <p className="text-white/60 text-xs line-clamp-2">{result.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onFeedback('similar')}
            className="flex-1 px-3 py-2 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border border-retro-green"
            title="Similar"
          >
            👍
          </button>
          <button
            onClick={() => onFeedback('different')}
            className="flex-1 px-3 py-2 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border border-retro-orange"
            title="Different"
          >
            👎
          </button>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border border-white/30 text-center"
            title="Visit"
          >
            →
          </a>
        </div>
      </div>
    </div>
  )
}

export default ResultBlock
