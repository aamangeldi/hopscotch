import { useState } from 'react'
import './App.css'
import HopscotchTrail from './components/HopscotchTrail'
import HopscotchBox from './components/HopscotchBox'

function App() {
  const [boxes, setBoxes] = useState([{ id: 1, type: 'input', query: null, results: null }])
  const [currentBox, setCurrentBox] = useState(1)
  const [context, setContext] = useState([])
  const [isLoading, setIsLoading] = useState(false)

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
    // Remove all boxes after the selected one
    setBoxes(prev => prev.filter(box => box.id <= boxId))

    // Reset context to only include items before this box
    const boxIndex = boxId - 1
    setContext(prev => prev.slice(0, Math.max(0, boxIndex - 1)))

    setCurrentBox(boxId)
  }

  return (
    <div className="min-h-screen p-8">
      <HopscotchTrail boxes={boxes} currentBox={currentBox} onJumpTo={jumpToBox} />

      <div className="mt-20 flex flex-col items-center gap-8">
        {boxes.map((box) => (
          <HopscotchBox
            key={box.id}
            box={box}
            isActive={box.id === currentBox}
            isLoading={isLoading && box.id === currentBox}
            onSearch={handleSearch}
            onFeedback={handleFeedback}
          />
        ))}
      </div>
    </div>
  )
}

export default App
