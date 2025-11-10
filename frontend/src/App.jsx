import { useState, useRef, useEffect } from 'react'
import './App.css'
import HopscotchTrail from './components/HopscotchTrail'
import HopscotchBox from './components/HopscotchBox'

// API URL - uses environment variable or falls back to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [boxes, setBoxes] = useState([{ id: 1, type: 'input', query: null, results: null }])
  const [currentBox, setCurrentBox] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingResults, setLoadingResults] = useState({}) // Track which specific results are loading: { boxId: [index0, index1, ...] }
  const [headerHeight, setHeaderHeight] = useState(0)
  const boxRefs = useRef({})
  const scrollContainerRef = useRef(null)
  const headerRef = useRef(null)

  // Measure header height once on mount
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }, [])

  // Scroll to current box when it changes
  useEffect(() => {
    if (boxRefs.current[currentBox] && scrollContainerRef.current && headerHeight > 0) {
      const boxElement = boxRefs.current[currentBox]
      const container = scrollContainerRef.current
      const boxTop = boxElement.offsetTop
      const boxHeight = boxElement.offsetHeight
      const containerHeight = container.clientHeight

      // Center the box in the visible viewport area (excluding header space)
      const scrollTo = boxTop - (containerHeight - boxHeight) / 2 - headerHeight / 2

      container.scrollTo({ top: scrollTo, behavior: 'smooth' })
    }
  }, [currentBox, headerHeight])

  const handleSearch = async (query, boxId) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
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

  const handleFeedback = async (result, feedback, boxId, resultIndex, allResults) => {
    // Determine which results will be loading on the current box
    const loadingIndices = feedback === 'similar'
      ? [0, 1, 2].filter(i => i !== resultIndex)  // Other 2 results
      : [resultIndex]  // Just the clicked result

    setLoadingResults({ [boxId]: loadingIndices })

    try {
      const response = await fetch(`${API_URL}/api/refine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback,
          clickedResult: result,
          allResults,
          resultIndex,
        }),
      })

      const data = await response.json()

      // Create new results array for the new box
      const newResults = [...allResults]
      if (feedback === 'similar') {
        // Replace the other 2 results with similar ones
        const otherIndices = [0, 1, 2].filter(i => i !== resultIndex)
        newResults[otherIndices[0]] = data.results[0]
        newResults[otherIndices[1]] = data.results[1]
      } else if (feedback === 'different') {
        // Replace only the clicked result with a different one
        newResults[resultIndex] = data.results[0]
      }

      // Get current box's query
      const currentBoxData = boxes.find(b => b.id === boxId)
      const query = currentBoxData?.query || 'refined search'

      // Create new box with refined results
      const newBoxId = boxId + 1
      setBoxes(prev => [...prev, { id: newBoxId, type: 'results', query, results: newResults }])
      setCurrentBox(newBoxId)
    } catch (error) {
      console.error('Error refining results:', error)
      alert('Error refining results. Make sure the backend is running!')
    } finally {
      setLoadingResults({})
    }
  }

  const jumpToBox = (boxId) => {
    // Just navigate to the box, don't delete anything
    setCurrentBox(boxId)
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <HopscotchTrail ref={headerRef} boxes={boxes} currentBox={currentBox} onJumpTo={jumpToBox} />

      <div
        ref={scrollContainerRef}
        className="pb-8 flex flex-col items-center gap-8 h-screen overflow-y-auto"
        style={{ paddingTop: `calc(${headerHeight}px + 2rem)` }}
      >
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
                loadingResults={loadingResults[box.id] || []}
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
