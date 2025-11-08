import { useState, useRef, useEffect } from 'react'
import './App.css'
import HopscotchTrail from './components/HopscotchTrail'
import HopscotchBox from './components/HopscotchBox'

function App() {
  const [boxes, setBoxes] = useState([{ id: 1, type: 'input', query: null, results: null }])
  const [currentBox, setCurrentBox] = useState(1)
  const [context, setContext] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const boxRefs = useRef({})
  const scrollContainerRef = useRef(null)

  // Scroll to current box when it changes
  useEffect(() => {
    if (boxRefs.current[currentBox] && scrollContainerRef.current) {
      const boxElement = boxRefs.current[currentBox]
      const container = scrollContainerRef.current
      const boxTop = boxElement.offsetTop
      const boxHeight = boxElement.offsetHeight
      const containerHeight = container.clientHeight
      const headerHeight = 96 // Keep at 96px for scroll calculation

      // Center the box in the visible viewport area (excluding header space)
      const scrollTo = boxTop - (containerHeight - boxHeight) / 2 - headerHeight / 2

      container.scrollTo({ top: scrollTo, behavior: 'smooth' })
    }
  }, [currentBox])

  const handleSearch = async (query, boxId) => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          context: context,
        }),
      })

      const data = await response.json()

      // Check if this box already exists
      const existingBox = boxes.find(b => b.id === boxId)

      if (existingBox) {
        // Update existing box with results
        setBoxes(prev => prev.map(box =>
          box.id === boxId
            ? { ...box, type: 'results', query, results: data.results }
            : box
        ))
      } else {
        // Create new box with results
        setBoxes(prev => [...prev, { id: boxId, type: 'results', query, results: data.results }])
      }

      setCurrentBox(boxId)
    } catch (error) {
      console.error('Error fetching results:', error)
      alert('Error fetching results. Make sure the backend is running!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = async (result, feedback, boxId) => {
    // Add to context
    const newContext = [...context, { title: result.title, feedback }]
    setContext(newContext)

    // Get current box's query
    const currentBoxData = boxes.find(b => b.id === boxId)
    const query = currentBoxData?.query || 'refined search'

    // Create new box with refined results
    const newBoxId = boxId + 1
    await handleSearch(query, newBoxId)
  }

  const jumpToBox = (boxId) => {
    // Just navigate to the box, don't delete anything
    setCurrentBox(boxId)
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <HopscotchTrail boxes={boxes} currentBox={currentBox} onJumpTo={jumpToBox} />

      <div ref={scrollContainerRef} className="pt-28 pb-8 flex flex-col items-center gap-8 h-screen overflow-y-auto">
        {boxes.map((box) => {
          const isLatestBox = box.id === boxes[boxes.length - 1].id
          return (
            <div
              key={box.id}
              ref={(el) => boxRefs.current[box.id] = el}
              className="w-full max-w-5xl"
            >
              <HopscotchBox
                box={box}
                isActive={box.id === currentBox}
                isLatest={isLatestBox}
                isLoading={isLoading && isLatestBox}
                onSearch={handleSearch}
                onFeedback={handleFeedback}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
