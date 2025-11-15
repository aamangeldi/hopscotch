import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BOX_COLORS } from '../constants'
import HopscotchBox from '../components/HopscotchBox'
import PromptSidebar from '../components/PromptSidebar'
import ReferencePointSidebar from '../components/ReferencePointSidebar'

const SummaryPage = ({ boxes, referencePoints }) => {
  const navigate = useNavigate()
  const { summaryId } = useParams()
  const [currentSummaryId, setCurrentSummaryId] = useState(summaryId || null)

  // Only show boxes with results
  const resultBoxes = boxes.filter(box => box.type === 'results' && box.results)

  // Start by showing the final box
  const [selectedBox, setSelectedBox] = useState(resultBoxes[resultBoxes.length - 1] || null)

  // Generate unique summary ID on first load
  useEffect(() => {
    if (!currentSummaryId && resultBoxes.length > 0) {
      const newId = Date.now().toString(36) + Math.random().toString(36).substr(2)
      setCurrentSummaryId(newId)
      navigate(`/summary/${newId}`, { replace: true })
    }
  }, [currentSummaryId, resultBoxes.length, navigate])

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      alert('Summary link copied to clipboard!')
    }).catch(err => {
      console.error('Failed to copy:', err)
    })
  }

  const handleBoxClick = (box) => {
    setSelectedBox(box)
  }

  const handleClickPrompt = (boxId) => {
    const box = resultBoxes.find(b => b.id === boxId)
    if (box) {
      setSelectedBox(box)
    }
  }

  const handleClickReferencePoint = (boxId) => {
    const box = resultBoxes.find(b => b.id === boxId)
    if (box) {
      setSelectedBox(box)
    }
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with profile and share button */}
      <div className="fixed top-0 left-0 right-0 bg-black border-b border-white/20 p-3 z-50">
        <div className="flex items-center justify-between">
          {/* Profile section */}
          <div className="flex items-center gap-3">
            <img
              src="/aliceinwonderland_profpic.png"
              alt="aliceinwonderland"
              className="w-10 h-10 rounded-full object-cover bg-gradient-to-br from-purple-500 to-pink-500"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'flex'
              }}
            />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg" style={{ display: 'none' }}>
              A
            </div>
            <span className="text-white font-medium">alice_in_wonderland</span>
          </div>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="px-6 py-2 bg-black text-white font-bold hover:bg-white/10 transition-colors border-2 border-white"
          >
            share
          </button>
        </div>
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
            <PromptSidebar prompts={prompts} onClickPrompt={handleClickPrompt} />

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
                    onAddReferencePoint={(result, boxId, source, steeringText) => {}}
                  />
                </div>
              )}
            </div>

            {/* Right sidebar - Reference points */}
            <ReferencePointSidebar referencePoints={referencePoints} onClickReferencePoint={handleClickReferencePoint} />
          </div>
        )}
      </div>
    </div>
  )
}

export default SummaryPage
