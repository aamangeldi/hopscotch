import { useState } from 'react'
import ResultCard from './ResultCard'

const HopscotchBox = ({ box, isActive, onSearch, onFeedback }) => {
  const [inputValue, setInputValue] = useState('')
  const [showInput, setShowInput] = useState(box.type === 'input')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSearch(inputValue, box.id)
      setInputValue('')
      setShowInput(false)
    }
  }

  const colors = ['border-retro-pink', 'border-retro-blue', 'border-retro-orange', 'border-retro-purple', 'border-retro-green', 'border-retro-yellow']
  const colorClass = colors[(box.id - 1) % colors.length]

  if (box.type === 'input' && !showInput) {
    return (
      <div
        className={`
          ${colorClass}
          bg-black
          w-64 h-64 rounded-3xl
          flex items-center justify-center
          text-9xl font-bold text-white
          transform transition-all duration-300
          border-4
          cursor-pointer
          hover:scale-105
          ${isActive ? 'animate-bounce' : ''}
        `}
        onClick={() => setShowInput(true)}
      >
        {box.id}
      </div>
    )
  }

  if (box.type === 'input' && showInput) {
    return (
      <div
        className={`
          ${colorClass}
          bg-black
          w-96 rounded-3xl p-8
          transform transition-all duration-300
          border-4
        `}
      >
        <div className="text-6xl font-bold text-white text-center mb-6">
          {box.id}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What are you looking for?"
            autoFocus
            className="w-full px-6 py-4 text-2xl rounded-2xl bg-black text-white border-2 border-white/30 focus:outline-none focus:border-white font-comic placeholder:text-white/50"
          />
          <button
            type="submit"
            className={`w-full mt-4 px-6 py-4 bg-black text-white text-2xl font-bold rounded-2xl hover:bg-white/10 transition-colors border-2 ${colorClass}`}
          >
            HOP!
          </button>
        </form>
      </div>
    )
  }

  if (box.type === 'results') {
    return (
      <div className="w-full max-w-6xl">
        <div className={`${colorClass} bg-black w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold text-white border-4 mx-auto mb-8`}>
          {box.id}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {box.results?.map((result, index) => (
            <ResultCard
              key={index}
              result={result}
              onFeedback={(feedback) => onFeedback(result, feedback, box.id)}
              colorClass={colors[index % colors.length]}
            />
          ))}
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => setShowInput(true)}
            className="px-8 py-4 bg-black text-white text-xl font-bold rounded-2xl hover:bg-white/10 transition-colors border-2 border-white/50"
          >
            Try different search
          </button>
        </div>

        {showInput && (
          <div className={`${colorClass} bg-black max-w-md mx-auto mt-8 rounded-3xl p-8 border-4`}>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What are you looking for?"
                autoFocus
                className="w-full px-6 py-4 text-xl rounded-2xl bg-black text-white border-2 border-white/30 focus:outline-none focus:border-white font-comic placeholder:text-white/50"
              />
              <button
                type="submit"
                className={`w-full mt-4 px-6 py-4 bg-black text-white text-xl font-bold rounded-2xl hover:bg-white/10 transition-colors border-2 ${colorClass}`}
              >
                HOP!
              </button>
            </form>
          </div>
        )}
      </div>
    )
  }

  return null
}

export default HopscotchBox
