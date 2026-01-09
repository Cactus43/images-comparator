import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../shared/context/AppContext.tsx';
import { ImageSliderComparator } from '../../ui/components/ImageSliderComparator.tsx';
import './Main.css';

export const Main: React.FC = () => {
  const {
    images,
    selectedImageIds,
    width,
    height,
    showLabels,
    toggleImageSelection,
    setSelectedImageIds,
    reorderImages,
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-select all images by default
  useEffect(() => {
    setSelectedImageIds(images.map(img => img.id));
  }, [images, setSelectedImageIds]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get selected images for comparison
  const selectedImages = selectedImageIds
    .map(id => images.find(img => img.id === id))
    .filter((img): img is NonNullable<typeof img> => img !== undefined)
    .map(img => ({ url: img.url, label: showLabels ? (img.label || img.name) : undefined }));

  const handleToggleImage = (id: string) => {
    toggleImageSelection(id);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    // Add a slight delay to show the drag effect
    setTimeout(() => {
      (e.target as HTMLElement).classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    (e.target as HTMLElement).classList.remove('dragging');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      reorderImages(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle reorder from the comparator view (selected images only)
  const handleComparatorReorder = (fromIndex: number, toIndex: number) => {
    // Map from selected images indices to full images list indices
    const fromImage = selectedImages[fromIndex];
    const toImage = selectedImages[toIndex];
    
    if (!fromImage || !toImage) return;
    
    const fromGlobalIndex = images.findIndex(img => img.url === fromImage.url);
    const toGlobalIndex = images.findIndex(img => img.url === toImage.url);
    
    if (fromGlobalIndex !== -1 && toGlobalIndex !== -1) {
      reorderImages(fromGlobalIndex, toGlobalIndex);
    }
  };

  return (
    <div className="images-comparator">
      {images.length >= 2 && (
        <div className="comparison-container">
          {/* Dropdown for selecting images - only shown when more than 2 images */}
          {images.length > 2 && (
            <div className="image-selector" ref={dropdownRef}>
              <button 
                className="selector-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{selectedImageIds.length} of {images.length} images</span>
                <svg 
                  className={`chevron ${isDropdownOpen ? 'open' : ''}`} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="selector-dropdown">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`selector-item ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <span className="drag-handle">⠿</span>
                      <input
                        type="checkbox"
                        checked={selectedImageIds.includes(image.id)}
                        onChange={() => handleToggleImage(image.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <img src={image.url} alt={image.name} className="selector-thumbnail" />
                      <span className="selector-label">{image.label || image.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <ImageSliderComparator 
            images={selectedImages}
            width={width}
            height={height}
            onReorder={handleComparatorReorder}
          />
        </div>
      )}

      {images.length === 1 && (
        <div className="single-image">
          <img src={images[0].url} alt={images[0].name} />
          {showLabels && (images[0].label || images[0].name) && (
            <span className="image-label">{images[0].label || images[0].name}</span>
          )}
        </div>
      )}

      {images.length === 0 && (
        <div className="empty-state">
          <p>No images loaded. Use the API to add images.</p>
        </div>
      )}
    </div>
  );
};
