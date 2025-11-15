import { useState, useEffect } from 'react'
import ResultBlock from './ResultBlock'
import { getBoxColorClass } from '../utils'

const HopscotchBox = ({ box, isActive, isLatest, isLoading, loadingResults, onSearch, onFeedback, onAddReferencePoint }) => {
  const [inputValue, setInputValue] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [newSearchValue, setNewSearchValue] = useState('')

  // Auto-flip the first input box after a delay
  useEffect(() => {
    if (box.type === 'input' && box.id === 1 && !showInput) {
      const timer = setTimeout(() => {
        setShowInput(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [box.type, box.id, showInput])

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

  const handleInspiredSearch = (inspirationSource) => {
    if (newSearchValue.trim() && !isLoading) {
      const targetBoxId = box.id + 1

      // Add to reference points if a specific box is selected (not generic)
      if (inspirationSource !== 'generic' && box.results?.[inspirationSource]) {
        onAddReferencePoint(box.results[inspirationSource], box.id, 'steering', newSearchValue)
      }

      // TODO: Backend implementation - pass inspiration source to search
      if (inspirationSource === 'generic') {
        console.log('Generic inspiration')
      } else {
        console.log(`Inspire from box ${inspirationSource + 1}:`, box.results?.[inspirationSource])
      }

      onSearch(newSearchValue, targetBoxId)
      setNewSearchValue('')
    }
  }

  const colorClass = getBoxColorClass(box.id)

  if (box.type === 'input') {
    return (
      <div className="relative w-full aspect-square max-h-[85vh]" style={{ perspective: '1000px' }}>
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: showInput ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front: Number */}
          <div
            className={`${colorClass} bg-black border-4 absolute inset-0 flex items-center justify-center`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="text-[20rem] font-bold text-white">{box.id}</span>
          </div>

          {/* Back: Input Form */}
          <div
            className={`${colorClass} bg-black border-4 absolute inset-0`}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
          {isLoading && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 border-4 ${colorClass} border-t-transparent rounded-full animate-spin`}></div>
                <div className="text-white text-xl font-bold">searching...</div>
              </div>
            </div>
          )}

          <div className={`w-full h-full flex flex-col items-center justify-center p-16 ${isLoading ? 'opacity-30' : ''}`}>
            <form onSubmit={handleSubmit} className="w-full max-w-3xl">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="let's discover something new..."
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
                hop
              </button>
            </form>
          </div>
          </div>
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
                <div className="text-white text-xl font-bold">searching...</div>
              </div>
            </div>
          )}

          <div className={`grid grid-cols-2 grid-rows-2 w-full h-full ${isLoading ? 'opacity-30' : ''}`}>
            {/* Top-left: Result 1 */}
            <div className="border-r-2 border-b-2 border-white/20">
              {box.results?.[0] && (
                <ResultBlock
                  result={box.results[0]}
                  onFeedback={(feedback) => onFeedback(box.results[0], feedback, box.id, 0, box.results)}
                  isLatest={isLatest}
                  isLoading={loadingResults.includes(0)}
                  isAnyLoading={loadingResults.length > 0}
                />
              )}
            </div>

            {/* Top-right: Result 2 */}
            <div className="border-b-2 border-white/20">
              {box.results?.[1] && (
                <ResultBlock
                  result={box.results[1]}
                  onFeedback={(feedback) => onFeedback(box.results[1], feedback, box.id, 1, box.results)}
                  isLatest={isLatest}
                  isLoading={loadingResults.includes(1)}
                  isAnyLoading={loadingResults.length > 0}
                />
              )}
            </div>

            {/* Bottom-left: Result 3 */}
            <div className="border-r-2 border-white/20">
              {box.results?.[2] && (
                <ResultBlock
                  result={box.results[2]}
                  onFeedback={(feedback) => onFeedback(box.results[2], feedback, box.id, 2, box.results)}
                  isLatest={isLatest}
                  isLoading={loadingResults.includes(2)}
                  isAnyLoading={loadingResults.length > 0}
                />
              )}
            </div>

            {/* Bottom-right: New prompt input */}
            <div className="flex items-center justify-center p-4">
              <div className={`w-full h-full flex flex-col justify-center ${!isLatest ? 'opacity-30' : ''}`}>
                <textarea
                  value={newSearchValue}
                  onChange={(e) => setNewSearchValue(e.target.value)}
                  placeholder="pull in a different dimension?"
                  rows={3}
                  disabled={isLoading || !isLatest}
                  className="w-full px-3 py-2 text-sm bg-black text-white border-2 border-white/30 focus:outline-none focus:border-white font-mono placeholder:text-white/50 resize-none mb-2 disabled:cursor-not-allowed"
                />

                {/* Inspiration buttons */}
                <div className="grid grid-cols-4 gap-1">
                  <button
                    onClick={() => handleInspiredSearch(0)}
                    disabled={isLoading || !isLatest}
                    className={`px-2 py-1 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border-2 ${colorClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    box1
                  </button>
                  <button
                    onClick={() => handleInspiredSearch(1)}
                    disabled={isLoading || !isLatest}
                    className={`px-2 py-1 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border-2 ${colorClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    box2
                  </button>
                  <button
                    onClick={() => handleInspiredSearch(2)}
                    disabled={isLoading || !isLatest}
                    className={`px-2 py-1 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border-2 ${colorClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    box3
                  </button>
                  <button
                    onClick={() => handleInspiredSearch('generic')}
                    disabled={isLoading || !isLatest}
                    className={`px-2 py-1 bg-black text-white text-xs font-bold hover:bg-white/10 transition-colors border-2 ${colorClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    generic
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }

  return null
}

export default HopscotchBox
