const PromptSidebar = ({ prompts }) => {
  return (
    <div className="w-64 flex-shrink-0 border-2 border-white/20 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
      <h3 className="text-lg font-bold mb-4 text-white/70">prompts</h3>
      <div className="space-y-4">
        {prompts.map((prompt) => (
          <div key={prompt.id} className={`border-2 ${prompt.colorClass} p-3 bg-black`}>
            <div className="text-xs text-white/50 mb-1">Box {prompt.id}</div>
            <div className="text-sm">{prompt.query}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PromptSidebar
