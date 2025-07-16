import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const NodeTypePopover = ({ position, onSelect, onClose, sourceNodeId }) => {
  const [showAllSections, setShowAllSections] = useState(false)
  const [secondaryPopover, setSecondaryPopover] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    selectedItem: null,
    options: []
  })
  const popoverRef = useRef(null)
  
  const menuStructure = [
    {
      id: 'explore',
      icon: '🔍',
      title: 'Explore the Idea',
      items: [
        { id: 'quick-question', label: 'Question to Consider', nodeType: 'question', behaviorType: '1-to-1', icon: '❓' },
        { id: 'different-angles', label: 'See Different Angles', nodeType: 'multi-option', behaviorType: '1-to-many', multiType: 'see-different-angles', icon: '🔄' },
        { id: 'perspective-shift', label: 'Perspective Shift', nodeType: 'custom', behaviorType: '1-to-1', icon: '🧭' },
        { id: 'similar-stuff', label: 'Find Similar Ideas', nodeType: 'multi-option', behaviorType: '1-to-many', multiType: 'similar-stuff', icon: '🧩' }
      ]
    },
    {
      id: 'expand',
      icon: '💡',
      title: 'Expand with Creativity',
      items: [
        { id: 'fresh-ideas', label: 'Find Fresh Ideas', nodeType: 'ideate', behaviorType: '1-to-1', icon: '💡' },
        { id: 'shift-perspectives', label: 'Shift Perspectives', nodeType: 'multi-option', behaviorType: '1-to-many', multiType: 'shift-perspectives', icon: '🔀' },
        { id: 'brainstorm', label: 'Generate Variations', nodeType: 'multi-option', behaviorType: '1-to-many', multiType: 'ideate', icon: '🌱' },
        { id: 'explore-deeper', label: 'Explore Further', nodeType: 'multi-option', behaviorType: '1-to-many', multiType: 'rabbit-hole', icon: '🚀' }
      ]
    },
    {
      id: 'clarify',
      icon: '🎯',
      title: 'Clarify the Problem',
      items: [
        { id: 'clarify-problem', label: 'Clarify the Problem', nodeType: 'multi-option', behaviorType: '1-to-many', multiType: 'clarify-problem' },
        { id: 'define-problem', label: 'Define the Problem', nodeType: 'analyze', behaviorType: '1-to-1' },
        { id: 'key-insights', label: 'Extract Key Insights', nodeType: 'multi-option', behaviorType: '1-to-many', multiType: 'key-insights' },
        { id: 'summarize', label: 'Key Takeaway', nodeType: 'summarize', behaviorType: '1-to-1' }
      ]
    },
    {
      id: 'test',
      icon: '🧪',
      title: 'Test Your Thinking',
      items: [
        { id: 'test-thinking', label: 'Test the Thinking', nodeType: 'multi-option', behaviorType: '1-to-many', multiType: 'test-thinking' },
        { id: 'pros-cons', label: 'List Pros & Cons', nodeType: 'multi-option', behaviorType: '1-to-many', multiType: 'pros-cons' },
        { id: 'try-out', label: 'Try It Out', nodeType: 'custom', behaviorType: '1-to-1' },
        { id: 'alternative', label: 'Find an Alternative', nodeType: 'ideate', behaviorType: '1-to-1' }
      ]
    },
    {
      id: 'build',
      icon: '✍️',
      title: 'Build Toward a Solution',
      items: [
        { id: 'build-on-this', label: 'Build on This', nodeType: 'multi-option', behaviorType: '1-to-many', multiType: 'build-on-this' },
        { id: 'action-steps', label: 'Create Action Steps', nodeType: 'analyze', behaviorType: '1-to-1' },
        { id: 'decision-made', label: 'Decision Made', nodeType: 'decision', behaviorType: '1-to-1' },
        { id: 'my-idea', label: 'Add My Own Idea', nodeType: 'ideate', behaviorType: '1-to-1' }
      ]
    }
  ]

  // Secondary options for 1-to-many items
  const getSecondaryOptions = (multiType) => {
    switch (multiType) {
      case 'see-different-angles':
        return [
          { label: 'User Perspective', nodeType: 'question', icon: '👤' },
          { label: 'Competitor View', nodeType: 'analyze', icon: '🏢' },
          { label: 'Ethical Lens', nodeType: 'custom', icon: '⚖️' },
          { label: 'Technical Constraint', nodeType: 'analyze', icon: '🔧' },
          { label: 'Opposite Assumption', nodeType: 'ideate', icon: '🔄' }
        ]
      case 'similar-stuff':
        return [
          { label: 'Related Theme', nodeType: 'ideate', icon: '🧩' },
          { label: 'Analogous Situation', nodeType: 'teach', icon: '📚' },
          { label: 'Parallel Case', nodeType: 'analyze', icon: '📊' },
          { label: 'Adjacent Idea', nodeType: 'ideate', icon: '💡' },
          { label: 'Shared Pattern', nodeType: 'summarize', icon: '📋' }
        ]
      case 'shift-perspectives':
        return [
          { label: 'What would an outsider say?', nodeType: 'question', icon: '👁️' },
          { label: 'Use a metaphor', nodeType: 'custom', icon: '🎭' },
          { label: 'Zoom out 10x', nodeType: 'analyze', icon: '🔍' },
          { label: 'Flip this idea', nodeType: 'ideate', icon: '🔄' },
          { label: 'Imagine the opposite', nodeType: 'ideate', icon: '🔄' }
        ]
      case 'ideate':
        return [
          { label: 'Wild Take', nodeType: 'ideate', icon: '🌪️' },
          { label: 'Simple Fix', nodeType: 'ideate', icon: '🔧' },
          { label: 'Bold Experiment', nodeType: 'ideate', icon: '🧪' },
          { label: 'Long-Term Vision', nodeType: 'ideate', icon: '🔮' },
          { label: 'Underdog Strategy', nodeType: 'ideate', icon: '💪' }
        ]
      case 'rabbit-hole':
        return [
          { label: 'What if…', nodeType: 'question', icon: '❓' },
          { label: 'Why might…', nodeType: 'question', icon: '🤔' },
          { label: 'How else…', nodeType: 'question', icon: '🔄' },
          { label: 'What happens when…', nodeType: 'question', icon: '⏰' },
          { label: 'Could it also…', nodeType: 'question', icon: '💭' }
        ]
      case 'key-insights':
        return [
          { label: 'Core Theme', nodeType: 'summarize', icon: '🎯' },
          { label: 'Underlying Pattern', nodeType: 'analyze', icon: '📊' },
          { label: 'Root Challenge', nodeType: 'analyze', icon: '🔍' }
        ]
      case 'pros-cons':
        return [
          { label: 'Possible Upside', nodeType: 'ideate', icon: '✅' },
          { label: 'Possible Risk', nodeType: 'analyze', icon: '⚠️' }
        ]
      case 'clarify-problem':
        return [
          { label: 'What problem is this solving?', nodeType: 'question', icon: '❓' },
          { label: 'Root cause?', nodeType: 'analyze', icon: '🔍' },
          { label: 'What\'s not the problem?', nodeType: 'custom', icon: '🚫' },
          { label: 'One-sentence definition', nodeType: 'summarize', icon: '📝' }
        ]
      case 'build-on-this':
        return [
          { label: 'Make this more useful', nodeType: 'ideate', icon: '🔧' },
          { label: 'Turn into framework', nodeType: 'custom', icon: '🏗️' },
          { label: 'Draft something here', nodeType: 'ideate', icon: '✍️' },
          { label: 'Shape a solution', nodeType: 'decision', icon: '✅' }
        ]
      case 'test-thinking':
        return [
          { label: 'Edge case scenario', nodeType: 'analyze', icon: '🔍' },
          { label: 'What could go wrong?', nodeType: 'question', icon: '❓' },
          { label: 'Simulate it', nodeType: 'custom', icon: '🎮' },
          { label: 'Real-world walk-through', nodeType: 'teach', icon: '👣' }
        ]
      default:
        return [
          { label: 'Option 1', nodeType: 'ideate', icon: '💡' },
          { label: 'Option 2', nodeType: 'question', icon: '❓' },
          { label: 'Option 3', nodeType: 'analyze', icon: '🔍' }
        ]
    }
  }

  // Standard node type definitions with consistent emojis
  const nodeTypeDefinitions = {
    question: { id: 'question', label: 'Question to Consider', icon: '❓', color: '#84cc16' },
    teach: { id: 'teach', label: 'Background Context', icon: '📚', color: '#3b82f6' },
    rabbithole: { id: 'rabbithole', label: 'Expand This Topic', icon: '🌀', color: '#6366f1' },
    summarize: { id: 'summarize', label: 'Key Takeaway', icon: '📋', color: '#8b5cf6' },
    ideate: { id: 'ideate', label: 'New Idea', icon: '💡', color: '#eab308' },
    analyze: { id: 'analyze', label: 'Insight or Tension', icon: '🔍', color: '#06b6d4' },
    custom: { id: 'custom', label: 'Open Prompt', icon: '⚙️', color: '#6b7280' },
    decision: { id: 'decision', label: 'Decision Made', icon: '✅', color: '#10b981' },
    'multi-option': { id: 'multi-option', label: 'Multi Option', icon: '🎯', color: '#8b5cf6' }
  }

  // Get sections to display
  const sectionsToShow = showAllSections ? menuStructure : menuStructure.slice(0, 2)

  // Handle item selection
  const handleItemSelect = (item, event) => {
    event.preventDefault()
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()
    
    if (item.behaviorType === '1-to-many') {
      // Show secondary popover for 1-to-many options
      const rect = event.currentTarget.getBoundingClientRect()
      const secondaryPosition = {
        x: rect.right + 10,
        y: rect.top
      }
      
      setSecondaryPopover({
        isOpen: true,
        position: secondaryPosition,
        selectedItem: item,
        options: getSecondaryOptions(item.multiType)
      })
    } else {
      // Handle 1-to-1 options directly
      const baseNodeType = nodeTypeDefinitions[item.nodeType]
      if (!baseNodeType) {
        console.error('Unknown node type:', item.nodeType)
        return
      }
      
      const selectedNodeType = {
        ...baseNodeType,
        label: item.label,
        behaviorType: item.behaviorType,
        multiType: item.multiType
      }
      
      console.log('Creating node:', selectedNodeType.label, 'Type:', selectedNodeType.id, 'Behavior:', selectedNodeType.behaviorType)
      
      setTimeout(() => {
        onSelect(selectedNodeType)
        onClose()
      }, 0)
    }
  }

  // Handle secondary option selection
  const handleSecondarySelect = (option) => {
    const baseNodeType = nodeTypeDefinitions[option.nodeType]
    if (!baseNodeType) {
      console.error('Unknown node type:', option.nodeType)
      return
    }
    
    const selectedNodeType = {
      ...baseNodeType,
      label: option.label,
      behaviorType: '1-to-1',
      icon: option.icon
    }
    
    console.log('Creating secondary node:', selectedNodeType.label, 'Type:', selectedNodeType.id)
    
    setTimeout(() => {
      onSelect(selectedNodeType)
      setSecondaryPopover({ isOpen: false, position: { x: 0, y: 0 }, selectedItem: null, options: [] })
      onClose()
    }, 0)
  }

  // Handle load more
  const handleLoadMore = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setShowAllSections(true)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          if (secondaryPopover.isOpen) {
            setSecondaryPopover({ isOpen: false, position: { x: 0, y: 0 }, selectedItem: null, options: [] })
          } else {
            onClose()
          }
          break
      }
    }

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        if (secondaryPopover.isOpen) {
          setSecondaryPopover({ isOpen: false, position: { x: 0, y: 0 }, selectedItem: null, options: [] })
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose, secondaryPopover.isOpen])

  return createPortal(
    <>
      <div 
        ref={popoverRef}
        className="node-type-popover" 
        style={{ 
          left: position.x, 
          top: position.y,
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {sectionsToShow.map((section) => (
          <div key={section.id} style={{ marginBottom: '10px' }}>
            {/* Section Heading */}
            <div style={{
              fontSize: '12px',
              color: '#9ca3af',
              fontWeight: '400',
              padding: '4px 12px 2px 12px',
              letterSpacing: '0.3px'
            }}>
              {section.title}
            </div>
            
            {/* Section Items */}
            {section.items.map((item) => {
              const nodeTypeDef = nodeTypeDefinitions[item.nodeType]
              const isMultiOption = item.behaviorType === '1-to-many'
              
              return (
                <div 
                  key={item.id}
                  className="popover-item"
                  onClick={(e) => handleItemSelect(item, e)}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 12px 6px 8px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '13px',
                    transition: 'background-color 0.1s ease',
                    color: '#374151',
                    userSelect: 'none',
                    marginLeft: '4px',
                    marginRight: '4px',
                    position: 'relative'
                  }}
                >
                  <span style={{ fontSize: '14px', marginRight: '8px' }}>
                    {item.icon || nodeTypeDef?.icon || '⚙️'}
                  </span>
                  <span style={{ flex: 1, color: '#374151' }}>
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
        
        {/* Load More Button */}
        {!showAllSections && (
          <div 
            className="load-more-button"
            onClick={handleLoadMore}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '13px',
              transition: 'background-color 0.1s ease',
              color: '#6b7280',
              userSelect: 'none',
              marginTop: '6px'
            }}
          >
            Load more options...
          </div>
        )}
      </div>

      {/* Secondary Popover */}
      {secondaryPopover.isOpen && (
        <div 
          className="node-type-popover secondary-popover" 
          style={{ 
            left: secondaryPopover.position.x, 
            top: secondaryPopover.position.y,
            animation: 'fadeIn 0.2s ease-out',
            zIndex: 1001
          }}
        >
          {/* Secondary Popover Header */}
          <div style={{
            fontSize: '12px',
            color: '#9ca3af',
            fontWeight: '400',
            padding: '4px 12px 2px 12px',
            letterSpacing: '0.3px',
            borderBottom: '1px solid #f3f4f6',
            marginBottom: '4px'
          }}>
            {secondaryPopover.selectedItem?.label}
          </div>
          
          {/* Secondary Options */}
          {secondaryPopover.options.map((option, index) => (
            <div 
              key={index}
              className="popover-item"
              onClick={() => handleSecondarySelect(option)}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 12px 6px 8px',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '13px',
                transition: 'background-color 0.1s ease',
                color: '#374151',
                userSelect: 'none',
                marginLeft: '4px',
                marginRight: '4px',
                position: 'relative'
              }}
            >
              <span style={{ fontSize: '14px', marginRight: '8px' }}>
                {option.icon}
              </span>
              <span style={{ flex: 1, color: '#374151' }}>
                {option.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </>,
    document.body
  )
}

export default NodeTypePopover 