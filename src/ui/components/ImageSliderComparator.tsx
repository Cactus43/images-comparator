import React, { useRef, useState, useCallback, useEffect } from 'react';
import './ImageSliderComparator.css';

interface ImageSliderComparatorProps {
  images: { url: string; label?: string }[];
  width?: number | string;
  height?: number | string;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export const ImageSliderComparator: React.FC<ImageSliderComparatorProps> = ({
  images,
  width = '100%',
  height = 500,
  onReorder,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPositions, setSliderPositions] = useState<number[]>([]);
  const [activeSlider, setActiveSlider] = useState<number | null>(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null);

  // Update slider positions when images change
  useEffect(() => {
    if (images.length <= 1) {
      setSliderPositions([]);
    } else {
      setSliderPositions(
        images.slice(0, -1).map((_, index) => 
          ((index + 1) / images.length) * 100
        )
      );
    }
  }, [images.length]);

  const handleMouseDown = useCallback((index: number) => {
    setActiveSlider(index);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (activeSlider === null || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

    setSliderPositions(prev => {
      const newPositions = [...prev];
      // Ensure sliders don't cross each other
      const minPos = activeSlider > 0 ? prev[activeSlider - 1] + 2 : 2;
      const maxPos = activeSlider < prev.length - 1 ? prev[activeSlider + 1] - 2 : 98;
      newPositions[activeSlider] = Math.max(minPos, Math.min(maxPos, percentage));
      return newPositions;
    });
  }, [activeSlider]);

  const handleMouseUp = useCallback(() => {
    setActiveSlider(null);
  }, []);

  const handleTouchStart = useCallback((index: number) => {
    setActiveSlider(index);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (activeSlider === null || !containerRef.current) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

    setSliderPositions(prev => {
      const newPositions = [...prev];
      const minPos = activeSlider > 0 ? prev[activeSlider - 1] + 2 : 2;
      const maxPos = activeSlider < prev.length - 1 ? prev[activeSlider + 1] - 2 : 98;
      newPositions[activeSlider] = Math.max(minPos, Math.min(maxPos, percentage));
      return newPositions;
    });
  }, [activeSlider]);

  const handleTouchEnd = useCallback(() => {
    setActiveSlider(null);
  }, []);

  // Image drag and drop handlers
  const handleImageDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    
    // Create a small custom drag image
    const dragImage = document.createElement('div');
    dragImage.style.cssText = `
      width: 80px;
      height: 60px;
      background: url(${images[index].url}) center/cover;
      border-radius: 6px;
      border: 2px solid #4a9eff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      position: absolute;
      top: -1000px;
      left: -1000px;
    `;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 40, 30);
    
    // Clean up the drag image element after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  }, [images]);

  const handleImageDragEnd = useCallback(() => {
    setDraggedImageIndex(null);
    setDragOverImageIndex(null);
  }, []);

  const handleImageDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedImageIndex !== null && draggedImageIndex !== index) {
      setDragOverImageIndex(index);
    }
  }, [draggedImageIndex]);

  const handleImageDragLeave = useCallback(() => {
    setDragOverImageIndex(null);
  }, []);

  const handleImageDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedImageIndex !== null && draggedImageIndex !== toIndex && onReorder) {
      onReorder(draggedImageIndex, toIndex);
    }
    setDraggedImageIndex(null);
    setDragOverImageIndex(null);
  }, [draggedImageIndex, onReorder]);

  // Calculate clip regions for each image
  const getClipPath = (index: number): string => {
    const leftBound = index === 0 ? 0 : sliderPositions[index - 1];
    const rightBound = index === images.length - 1 ? 100 : sliderPositions[index];
    return `inset(0 ${100 - rightBound}% 0 ${leftBound}%)`;
  };

  if (images.length === 0) {
    return (
      <div className="image-slider-empty">
        <p>No images to compare</p>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="image-slider-single" style={{ width, height }}>
        <img src={images[0].url} alt={images[0].label || 'Image'} />
        {images[0].label && (
          <span className="image-label">{images[0].label}</span>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`image-slider-comparator ${activeSlider !== null ? 'dragging' : ''}`}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Render all images with clip paths */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`image-layer ${draggedImageIndex === index ? 'dragging' : ''} ${dragOverImageIndex === index ? 'drag-over' : ''}`}
          style={{ clipPath: getClipPath(index) }}
          draggable={!!onReorder}
          onDragStart={(e) => handleImageDragStart(e, index)}
          onDragEnd={handleImageDragEnd}
          onDragOver={(e) => handleImageDragOver(e, index)}
          onDragLeave={handleImageDragLeave}
          onDrop={(e) => handleImageDrop(e, index)}
        >
          <img src={image.url} alt={image.label || `Image ${index + 1}`} draggable={false} />
          {image.label && (
            <span 
              className="image-label"
              style={{
                left: index === 0 
                  ? '10px' 
                  : index === images.length - 1 
                    ? 'auto' 
                    : `${(sliderPositions[index - 1] + (sliderPositions[index] || 100)) / 2}%`,
                right: index === images.length - 1 ? '10px' : 'auto',
                transform: index !== 0 && index !== images.length - 1 ? 'translateX(-50%)' : 'none',
              }}
            >
              {image.label}
            </span>
          )}
        </div>
      ))}

      {/* Render slider handles */}
      {sliderPositions.map((position, index) => (
        <div
          key={`slider-${index}`}
          className={`slider-handle ${activeSlider === index ? 'active' : ''}`}
          style={{ left: `${position}%` }}
          onMouseDown={() => handleMouseDown(index)}
          onTouchStart={() => handleTouchStart(index)}
        >
          <div className="slider-line" />
          <div className="slider-button">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l-7-7 7-7zm8 0v14l7-7-7-7z" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};
