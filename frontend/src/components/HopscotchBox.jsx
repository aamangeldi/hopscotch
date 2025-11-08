import { useState } from 'react'
import ResultBlock from './ResultBlock'

const HopscotchBox = ({ box, isActive, isLatest, isLoading, onSearch, onFeedback }) => {
  const [inputValue, setInputValue] = useState('')
  const [showInput, setShowInput] = useState(box.type === 'input')
  const [newSearchValue, setNewSearchValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      // For input boxes, use current box ID; for results, create new box
      const targetBoxId = box.type === 'input' ? box.id : box.id + 1
      onSearch(inputValue, targetBoxId)
      setInputValue('')
      // Don't collapse during loading - keep form visible
      // setShowInput(false)
    }
  }

  const handleNewSearchSubmit = (e) => {
    e.preventDefault()
    if (newSearchValue.trim() && !isLoading) {
      const targetBoxId = box.id + 1
      onSearch(newSearchValue, targetBoxId)
      setNewSearchValue('')
    }
  }

  const colors = ['border-retro-blue', 'border-retro-orange', 'border-retro-purple', 'border-retro-green', 'border-retro-yellow', 'border-retro-pink']
  const colorClass = colors[(box.id - 1) % colors.length]

  if (box.type === 'input' && showInput) {
    return (
        <div className={`${colorClass} bg-black border-4 aspect-square w-full max-h-[85vh] relative`}>
          {isLoading && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 border-4 ${colorClass} border-t-transparent rounded-full animate-spin`}></div>
                <div className="text-white text-xl font-bold">Searching...</div>
              </div>
            </div>
          )}

          <div className={`w-full h-full flex flex-col items-center justify-center p-16 ${isLoading ? 'opacity-30' : ''}`}>
            <div className="text-6xl font-bold text-white text-center mb-12">
              {box.id}
            </div>
            <form onSubmit={handleSubmit} className="w-full max-w-3xl">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What are you looking for?"
                autoFocus
                rows={5}
                disabled={isLoading}
                className="w-full px-8 py-6 text-2xl bg-black text-white border-2 border-white/30 focus:outline-none focus:border-white font-mono placeholder:text-white/50 resize-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full mt-8 px-8 py-6 bg-black text-white text-2xl font-bold hover:bg-white/10 transition-colors border-2 ${colorClass} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Hop
              </button>
            </form>
          </div>
        </div>
    )
  }

  if (box.type === 'results') {
    return (
        <div className={`${colorClass} bg-black border-4 aspect-square w-full max-h-[85vh] relative`}>
          {isLoading && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 border-4 ${colorClass} border-t-transparent rounded-full animate-spin`}></div>
                <div className="text-white text-xl font-bold">Searching...</div>
              </div>
            </div>
          )}

          <div className={`grid grid-cols-2 grid-rows-2 w-full h-full ${isLoading ? 'opacity-30' : ''}`}>
            {/* Top-left: Result 1 */}
            <div className="border-r-2 border-b-2 border-white/20">
              {box.results?.[0] && (
                <ResultBlock
                  result={box.results[0]}
                  onFeedback={(feedback) => onFeedback(box.results[0], feedback, box.id)}
                />
              )}
            </div>

            {/* Top-right: Result 2 */}
            <div className="border-b-2 border-white/20">
              {box.results?.[1] && (
                <ResultBlock
                  result={box.results[1]}
                  onFeedback={(feedback) => onFeedback(box.results[1], feedback, box.id)}
                />
              )}
            </div>

            {/* Bottom-left: Result 3 */}
            <div className="border-r-2 border-white/20">
              {box.results?.[2] && (
                <ResultBlock
                  result={box.results[2]}
                  onFeedback={(feedback) => onFeedback(box.results[2], feedback, box.id)}
                />
              )}
            </div>

            {/* Bottom-right: New prompt input */}
            <div className="flex items-center justify-center p-4">
              <form onSubmit={handleNewSearchSubmit} className={`w-full h-full flex flex-col justify-center ${!isLatest ? 'opacity-30' : ''}`}>
                <textarea
                  value={newSearchValue}
                  onChange={(e) => setNewSearchValue(e.target.value)}
                  placeholder="or something else?"
                  rows={2}
                  disabled={isLoading || !isLatest}
                  className="w-full px-3 py-2 text-sm bg-black text-white border-2 border-white/30 focus:outline-none focus:border-white font-mono placeholder:text-white/50 resize-none mb-2 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isLoading || !isLatest}
                  className={`w-full px-3 py-2 bg-black text-white text-sm font-bold hover:bg-white/10 transition-colors border-2 ${colorClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Hop
                </button>
              </form>
            </div>
          </div>
        </div>
    )
  }

  return null
}

export default HopscotchBox
