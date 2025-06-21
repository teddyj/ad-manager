import React, { useMemo } from 'react';

/**
 * SnapGuides Component
 * Smart alignment guides and object snapping for Phase 5: Advanced Controls & Interactions
 * Features visual alignment guides, snap indicators, and measurement displays
 */
function SnapGuides({ 
  elements, 
  activeElementId,
  canvasDimensions,
  snapThreshold = 5,
  showGuides = true,
  showMeasurements = true
}) {
  // Generate snap guides based on other elements
  const snapGuides = useMemo(() => {
    if (!activeElementId || !showGuides) return [];

    const activeElement = elements.find(el => el.id === activeElementId);
    if (!activeElement) return [];

    const otherElements = elements.filter(el => 
      el.id !== activeElementId && 
      el.visible !== false && 
      !el.locked
    );

    const guides = [];

    // Canvas edge guides
    guides.push(
      // Canvas edges
      { type: 'canvas-edge', orientation: 'vertical', x: 0, label: 'Left edge' },
      { type: 'canvas-edge', orientation: 'vertical', x: canvasDimensions.width, label: 'Right edge' },
      { type: 'canvas-edge', orientation: 'horizontal', y: 0, label: 'Top edge' },
      { type: 'canvas-edge', orientation: 'horizontal', y: canvasDimensions.height, label: 'Bottom edge' },
      
      // Canvas center lines
      { type: 'canvas-center', orientation: 'vertical', x: canvasDimensions.width / 2, label: 'H-Center' },
      { type: 'canvas-center', orientation: 'horizontal', y: canvasDimensions.height / 2, label: 'V-Center' }
    );

    // Element-based guides
    otherElements.forEach(element => {
      const { x, y } = element.position;
      const { width, height } = element.size;

      // Vertical guides (X positions)
      guides.push(
        { type: 'element', orientation: 'vertical', x: x, elementId: element.id, edge: 'left' },
        { type: 'element', orientation: 'vertical', x: x + width, elementId: element.id, edge: 'right' },
        { type: 'element', orientation: 'vertical', x: x + width/2, elementId: element.id, edge: 'center' }
      );

      // Horizontal guides (Y positions)
      guides.push(
        { type: 'element', orientation: 'horizontal', y: y, elementId: element.id, edge: 'top' },
        { type: 'element', orientation: 'horizontal', y: y + height, elementId: element.id, edge: 'bottom' },
        { type: 'element', orientation: 'horizontal', y: y + height/2, elementId: element.id, edge: 'middle' }
      );
    });

    return guides;
  }, [elements, activeElementId, canvasDimensions, showGuides]);

  // Find active snap guides for the current element
  const activeSnapGuides = useMemo(() => {
    if (!activeElementId || !showGuides) return [];

    const activeElement = elements.find(el => el.id === activeElementId);
    if (!activeElement) return [];

    const { x, y } = activeElement.position;
    const { width, height } = activeElement.size;
    
    const activeGuides = [];

    snapGuides.forEach(guide => {
      let isActive = false;
      let snapPosition = null;

      if (guide.orientation === 'vertical' && guide.x !== undefined) {
        // Check if any edge of the active element is close to this guide
        const leftEdge = Math.abs(x - guide.x);
        const rightEdge = Math.abs((x + width) - guide.x);
        const centerEdge = Math.abs((x + width/2) - guide.x);

        if (leftEdge <= snapThreshold) {
          isActive = true;
          snapPosition = { edge: 'left', distance: leftEdge };
        } else if (rightEdge <= snapThreshold) {
          isActive = true;
          snapPosition = { edge: 'right', distance: rightEdge };
        } else if (centerEdge <= snapThreshold) {
          isActive = true;
          snapPosition = { edge: 'center', distance: centerEdge };
        }
      }

      if (guide.orientation === 'horizontal' && guide.y !== undefined) {
        // Check if any edge of the active element is close to this guide
        const topEdge = Math.abs(y - guide.y);
        const bottomEdge = Math.abs((y + height) - guide.y);
        const middleEdge = Math.abs((y + height/2) - guide.y);

        if (topEdge <= snapThreshold) {
          isActive = true;
          snapPosition = { edge: 'top', distance: topEdge };
        } else if (bottomEdge <= snapThreshold) {
          isActive = true;
          snapPosition = { edge: 'bottom', distance: bottomEdge };
        } else if (middleEdge <= snapThreshold) {
          isActive = true;
          snapPosition = { edge: 'middle', distance: middleEdge };
        }
      }

      if (isActive) {
        activeGuides.push({
          ...guide,
          snapPosition,
          activeElement: activeElement.id
        });
      }
    });

    return activeGuides;
  }, [elements, activeElementId, snapGuides, snapThreshold, showGuides]);

  // Calculate measurements between elements
  const measurements = useMemo(() => {
    if (!activeElementId || !showMeasurements) return [];

    const activeElement = elements.find(el => el.id === activeElementId);
    if (!activeElement) return [];

    const otherElements = elements.filter(el => 
      el.id !== activeElementId && 
      el.visible !== false
    );

    const measurements = [];

    otherElements.forEach(element => {
      const activeRect = {
        left: activeElement.position.x,
        right: activeElement.position.x + activeElement.size.width,
        top: activeElement.position.y,
        bottom: activeElement.position.y + activeElement.size.height,
        centerX: activeElement.position.x + activeElement.size.width / 2,
        centerY: activeElement.position.y + activeElement.size.height / 2
      };

      const otherRect = {
        left: element.position.x,
        right: element.position.x + element.size.width,
        top: element.position.y,
        bottom: element.position.y + element.size.height,
        centerX: element.position.x + element.size.width / 2,
        centerY: element.position.y + element.size.height / 2
      };

      // Horizontal spacing measurements
      if (activeRect.right < otherRect.left) {
        // Active element is to the left
        const distance = otherRect.left - activeRect.right;
        measurements.push({
          type: 'horizontal-spacing',
          distance,
          startX: activeRect.right,
          endX: otherRect.left,
          y: Math.max(activeRect.top, otherRect.top),
          label: `${Math.round(distance)}px`
        });
      } else if (otherRect.right < activeRect.left) {
        // Active element is to the right
        const distance = activeRect.left - otherRect.right;
        measurements.push({
          type: 'horizontal-spacing',
          distance,
          startX: otherRect.right,
          endX: activeRect.left,
          y: Math.max(activeRect.top, otherRect.top),
          label: `${Math.round(distance)}px`
        });
      }

      // Vertical spacing measurements
      if (activeRect.bottom < otherRect.top) {
        // Active element is above
        const distance = otherRect.top - activeRect.bottom;
        measurements.push({
          type: 'vertical-spacing',
          distance,
          startY: activeRect.bottom,
          endY: otherRect.top,
          x: Math.max(activeRect.left, otherRect.left),
          label: `${Math.round(distance)}px`
        });
      } else if (otherRect.bottom < activeRect.top) {
        // Active element is below
        const distance = activeRect.top - otherRect.bottom;
        measurements.push({
          type: 'vertical-spacing',
          distance,
          startY: otherRect.bottom,
          endY: activeRect.top,
          x: Math.max(activeRect.left, otherRect.left),
          label: `${Math.round(distance)}px`
        });
      }
    });

    return measurements;
  }, [elements, activeElementId, showMeasurements]);

  if (!showGuides && !showMeasurements) {
    return null;
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 999 }}
    >
      {/* Snap Guides */}
      {showGuides && activeSnapGuides.map((guide, index) => (
        <div key={`guide-${index}`}>
          {guide.orientation === 'vertical' && (
            <div
              className={`absolute border-l-2 pointer-events-none transition-opacity duration-200 ${
                guide.type === 'canvas-edge' 
                  ? 'border-red-400' 
                  : guide.type === 'canvas-center'
                  ? 'border-blue-400'
                  : 'border-green-400'
              }`}
              style={{
                left: guide.x,
                top: 0,
                height: canvasDimensions.height,
                opacity: 0.8
              }}
            />
          )}
          {guide.orientation === 'horizontal' && (
            <div
              className={`absolute border-t-2 pointer-events-none transition-opacity duration-200 ${
                guide.type === 'canvas-edge' 
                  ? 'border-red-400' 
                  : guide.type === 'canvas-center'
                  ? 'border-blue-400'
                  : 'border-green-400'
              }`}
              style={{
                top: guide.y,
                left: 0,
                width: canvasDimensions.width,
                opacity: 0.8
              }}
            />
          )}
          
          {/* Guide Label */}
          {(guide.label || guide.edge) && (
            <div
              className="absolute bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none"
              style={{
                left: guide.orientation === 'vertical' ? guide.x + 5 : 5,
                top: guide.orientation === 'horizontal' ? guide.y + 5 : 5,
                whiteSpace: 'nowrap'
              }}
            >
              {guide.label || guide.edge}
              {guide.snapPosition && ` (${Math.round(guide.snapPosition.distance)}px)`}
            </div>
          )}
        </div>
      ))}

      {/* Measurements */}
      {showMeasurements && measurements.map((measurement, index) => (
        <div key={`measurement-${index}`}>
          {measurement.type === 'horizontal-spacing' && (
            <div>
              {/* Measurement Line */}
              <div
                className="absolute border-t border-purple-400 pointer-events-none"
                style={{
                  left: measurement.startX,
                  top: measurement.y,
                  width: measurement.endX - measurement.startX
                }}
              />
              {/* Start Cap */}
              <div
                className="absolute border-l border-purple-400 pointer-events-none"
                style={{
                  left: measurement.startX,
                  top: measurement.y - 5,
                  height: 10
                }}
              />
              {/* End Cap */}
              <div
                className="absolute border-l border-purple-400 pointer-events-none"
                style={{
                  left: measurement.endX,
                  top: measurement.y - 5,
                  height: 10
                }}
              />
              {/* Label */}
              <div
                className="absolute bg-purple-600 text-white text-xs px-1 py-0.5 rounded pointer-events-none"
                style={{
                  left: (measurement.startX + measurement.endX) / 2 - 15,
                  top: measurement.y - 20
                }}
              >
                {measurement.label}
              </div>
            </div>
          )}

          {measurement.type === 'vertical-spacing' && (
            <div>
              {/* Measurement Line */}
              <div
                className="absolute border-l border-purple-400 pointer-events-none"
                style={{
                  left: measurement.x,
                  top: measurement.startY,
                  height: measurement.endY - measurement.startY
                }}
              />
              {/* Start Cap */}
              <div
                className="absolute border-t border-purple-400 pointer-events-none"
                style={{
                  left: measurement.x - 5,
                  top: measurement.startY,
                  width: 10
                }}
              />
              {/* End Cap */}
              <div
                className="absolute border-t border-purple-400 pointer-events-none"
                style={{
                  left: measurement.x - 5,
                  top: measurement.endY,
                  width: 10
                }}
              />
              {/* Label */}
              <div
                className="absolute bg-purple-600 text-white text-xs px-1 py-0.5 rounded pointer-events-none"
                style={{
                  left: measurement.x + 10,
                  top: (measurement.startY + measurement.endY) / 2 - 8
                }}
              >
                {measurement.label}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Snap Indicators */}
      {activeSnapGuides.length > 0 && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none">
          Snapping: {activeSnapGuides.length} guide{activeSnapGuides.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

export default SnapGuides; 