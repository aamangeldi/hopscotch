import { useRef, useEffect } from 'react'
import HopscotchTrail from '../components/HopscotchTrail'
import HopscotchBox from '../components/HopscotchBox'

const HomePage = ({
  boxes,
  currentBox,
  isLoading,
  loadingResults,
  onSearch,
  onFeedback,
  onAddReferencePoint,
  onJumpToBox,
  headerHeight,
  setHeaderHeight
}) => {
  const boxRefs = useRef({})
  const scrollContainerRef = useRef(null)
  const headerRef = useRef(null)

  // Measure header height once on mount
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }, [setHeaderHeight])

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

  return (
    <div className="min-h-screen overflow-hidden">
      <HopscotchTrail ref={headerRef} boxes={boxes} currentBox={currentBox} onJumpTo={onJumpToBox} />

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
                onSearch={onSearch}
                onFeedback={onFeedback}
                onAddReferencePoint={onAddReferencePoint}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HomePage
