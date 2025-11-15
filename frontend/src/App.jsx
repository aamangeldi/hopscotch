import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import SummaryPage from './pages/SummaryPage'

// API URL - uses environment variable or falls back to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [boxes, setBoxes] = useState([{ id: 1, type: 'input', query: null, results: null }])
  const [currentBox, setCurrentBox] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingResults, setLoadingResults] = useState({}) // Track which specific results are loading: { boxId: [index0, index1, ...] }
  const [headerHeight, setHeaderHeight] = useState(0)
  const [referencePoints, setReferencePoints] = useState([]) // Track results marked as reference points

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

  const addReferencePoint = (result, boxId, source = 'similar', steeringText = null) => {
    setReferencePoints(prev => [...prev, { ...result, boxId, source, steeringText }])
  }

  const handleFeedback = async (result, feedback, boxId, resultIndex, allResults) => {
    // Track reference point when "similar" is clicked
    if (feedback === 'similar') {
      addReferencePoint(result, boxId)
    }

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
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            boxes={boxes}
            currentBox={currentBox}
            isLoading={isLoading}
            loadingResults={loadingResults}
            onSearch={handleSearch}
            onFeedback={handleFeedback}
            onAddReferencePoint={addReferencePoint}
            onJumpToBox={jumpToBox}
            headerHeight={headerHeight}
            setHeaderHeight={setHeaderHeight}
          />
        }
      />
      <Route
        path="/summary"
        element={<SummaryPage boxes={boxes} referencePoints={referencePoints} />}
      />
      <Route
        path="/summary/:summaryId"
        element={<SummaryPage boxes={boxes} referencePoints={referencePoints} />}
      />
    </Routes>
  )
}

export default App
