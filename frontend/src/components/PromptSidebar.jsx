const PromptSidebar = ({ prompts, onClickPrompt }) => {
  return (
    <div className="w-64 flex-shrink-0 border-2 border-white/20 bg-black" style={{ maxHeight: 'calc(100vh - 250px)' }}>
      <h3 className="text-lg font-bold p-4 pb-2 text-white/70 sticky top-0 bg-black z-10">steering</h3>
      <div className="space-y-4 p-4 pt-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className={`border-2 ${prompt.colorClass} p-3 bg-black cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={() => onClickPrompt(prompt.id)}
          >
            <div className="text-xs text-white/50 mb-1">Box {prompt.id}</div>
            <div className="text-sm">{prompt.query}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PromptSidebar
