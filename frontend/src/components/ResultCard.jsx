const ResultCard = ({ result, onFeedback, colorClass }) => {
  return (
    <div className={`bg-black rounded-3xl ${colorClass} border-2 overflow-hidden transform transition-all hover:scale-105`}>
      <div className="aspect-video overflow-hidden border-b-2 border-white/20">
        <img
          src={result.image_url}
          alt={result.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400'
          }}
        />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2 text-white">{result.title}</h3>
        <p className="text-white/70 mb-4 text-sm">{result.description}</p>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${colorClass.replace('border-', 'text-')} hover:text-white font-bold text-sm underline block mb-4`}
        >
          Visit →
        </a>
        <div className="flex gap-3">
          <button
            onClick={() => onFeedback('similar')}
            className="flex-1 px-4 py-3 bg-black text-white font-bold rounded-xl hover:bg-white/10 transition-colors border-2 border-retro-green"
          >
            👍 Similar
          </button>
          <button
            onClick={() => onFeedback('different')}
            className="flex-1 px-4 py-3 bg-black text-white font-bold rounded-xl hover:bg-white/10 transition-colors border-2 border-retro-orange"
          >
            👎 Different
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultCard
