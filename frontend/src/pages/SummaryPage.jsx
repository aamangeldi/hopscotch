import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BOX_COLORS } from '../constants'
import HopscotchBox from '../components/HopscotchBox'
import PromptSidebar from '../components/PromptSidebar'
import PositiveSignalSidebar from '../components/PositiveSignalSidebar'

const SummaryPage = ({ boxes }) => {
  const navigate = useNavigate()

  // Only show boxes with results
  const resultBoxes = boxes.filter(box => box.type === 'results' && box.results)

  // Start by showing the final box
  const [selectedBox, setSelectedBox] = useState(resultBoxes[resultBoxes.length - 1] || null)

  const handleBackClick = () => {
    navigate('/')
  }

  const handleBoxClick = (box) => {
    setSelectedBox(box)
  }

  // Get prompts that changed from the previous box
  const prompts = boxes
    .filter(box => box.query)
    .reduce((acc, box, index, arr) => {
      // Include first prompt or when query changes from previous
      if (index === 0 || box.query !== arr[index - 1].query) {
        acc.push({
          id: box.id,
          query: box.query,
          colorClass: BOX_COLORS[(box.id - 1) % BOX_COLORS.length]
        })
      }
      return acc
    }, [])

  // Get all results that were clicked as "similar" - TODO: track this in state
  const similarClicks = []

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with back button */}
      <div className="fixed top-0 left-0 right-0 bg-black border-b border-white/20 p-3 z-50">
        <button
          onClick={handleBackClick}
          className="px-6 py-3 bg-black text-white text-lg font-bold hover:bg-white/10 transition-colors border-2 border-white"
        >
          ← back to hopscotch
        </button>
      </div>

      {/* Hopscotch boxes at the top */}
      <div className="pt-24 pb-8">
        <div className="flex flex-wrap gap-4 mb-8 justify-center px-8">
          {resultBoxes.map((box) => {
            const colorClass = BOX_COLORS[(box.id - 1) % BOX_COLORS.length]
            const isSelected = selectedBox?.id === box.id

            return (
              <button
                key={box.id}
                onClick={() => handleBoxClick(box)}
                className={`
                  ${colorClass}
                  ${isSelected ? 'scale-95 ring-4 ring-white/50' : 'hover:scale-95'}
                  w-20 h-20
                  flex items-center justify-center
                  text-2xl font-bold text-white
                  transform transition-all duration-200
                  border-4 bg-black
                  cursor-pointer
                `}
              >
                {box.id}
              </button>
            )
          })}
        </div>

        {/* Main content with sidebars */}
        {resultBoxes.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            <p className="text-xl">No hopscotch results yet. Start exploring first!</p>
          </div>
        ) : (
          <div className="flex gap-4 px-4">
            {/* Left sidebar - Prompts */}
            <PromptSidebar prompts={prompts} />

            {/* Center - Selected box display */}
            <div className="flex-1 flex flex-col items-center">
              {selectedBox && (
                <div className="w-full max-w-3xl">
                  <HopscotchBox
                    box={selectedBox}
                    isActive={false}
                    isLatest={false}
                    isLoading={false}
                    loadingResults={[]}
                    onSearch={() => {}}
                    onFeedback={() => {}}
                  />
                </div>
              )}
            </div>

            {/* Right sidebar - Similar clicks */}
            <PositiveSignalSidebar similarClicks={similarClicks} />
          </div>
        )}
      </div>
    </div>
  )
}

export default SummaryPage
