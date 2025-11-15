const PositiveSignalSidebar = ({ similarClicks }) => {
  return (
    <div className="w-64 flex-shrink-0 border-2 border-white/20 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
      <h3 className="text-lg font-bold mb-4 text-white/70">similar clicks</h3>
      <div className="space-y-4">
        {similarClicks.length === 0 ? (
          <div className="text-sm text-white/50">No similar clicks yet</div>
        ) : (
          similarClicks.map((click, index) => (
            <div key={index} className="border border-white/20">
              <img
                src={click.image_url}
                alt={click.title}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <div className="p-2">
                <button className="w-full px-2 py-1 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border border-green-500">
                  similar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PositiveSignalSidebar
