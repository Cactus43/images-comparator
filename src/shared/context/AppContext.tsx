import React, { createContext, useContext, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import type { ComparisonImage } from '../../domain/entities/ComparisonImage.ts';
import { setGlobalStore } from '../../index.tsx';
import type { ImageConfig, ImagesComparatorEvents } from '../../index.tsx';

interface AppContextType {
  images: ComparisonImage[];
  selectedImageIds: string[];
  width: number | string;
  height: number | string;
  showLabels: boolean;
  setImages: React.Dispatch<React.SetStateAction<ComparisonImage[]>>;
  removeImage: (id: string) => void;
  updateImage: (id: string, updates: Partial<ComparisonImage>) => void;
  toggleImageSelection: (id: string) => void;
  selectAllImages: () => void;
  clearSelection: () => void;
  setSelectedImageIds: React.Dispatch<React.SetStateAction<string[]>>;
  reorderImages: (fromIndex: number, toIndex: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
  initialConfig?: {
    images?: ImageConfig[];
    width?: number | string;
    height?: number | string;
    showLabels?: boolean;
  };
  events?: ImagesComparatorEvents;
}

function extractNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop() || 'image';
    return decodeURIComponent(filename);
  } catch {
    return 'image';
  }
}

export const AppProvider: React.FC<AppProviderProps> = ({ 
  children, 
  initialConfig,
  events 
}) => {
  // Generate IDs once and use them for both images and selection
  const [initialImages] = useState<ComparisonImage[]>(() => {
    if (!initialConfig?.images) return [];
    return initialConfig.images.map(img => ({
      id: img.id || crypto.randomUUID(),
      name: img.name || extractNameFromUrl(img.url),
      url: img.url,
      label: img.label,
    }));
  });

  const [images, setImages] = useState<ComparisonImage[]>(initialImages);
  
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>(() => {
    // Auto-select all initial images using the same IDs
    return initialImages.map(img => img.id);
  });
  const width = initialConfig?.width ?? '100%';
  const height = initialConfig?.height ?? 500;
  const showLabels = initialConfig?.showLabels ?? true;

  // Register global store for external API access - use useLayoutEffect to ensure it's ready immediately
  useLayoutEffect(() => {
    setGlobalStore({
      images,
      selectedIds: selectedImageIds,
      width,
      height,
      showLabels,
      setImages,
      setSelectedIds: setSelectedImageIds,
      events: events || {},
    });
  }, [images, selectedImageIds, width, height, showLabels, events]);

  // Notify selection changes
  useEffect(() => {
    events?.onSelectionChange?.(selectedImageIds);
  }, [selectedImageIds, events]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setSelectedImageIds(prev => prev.filter(imgId => imgId !== id));
    events?.onImageRemove?.(id);
  }, [events]);

  const updateImage = useCallback((id: string, updates: Partial<ComparisonImage>) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
  }, []);

  const toggleImageSelection = useCallback((id: string) => {
    setSelectedImageIds(prev => 
      prev.includes(id) 
        ? prev.filter(imgId => imgId !== id)
        : [...prev, id]
    );
  }, []);

  const selectAllImages = useCallback(() => {
    setSelectedImageIds(images.map(img => img.id));
  }, [images]);

  const clearSelection = useCallback(() => {
    setSelectedImageIds([]);
  }, []);

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  }, []);

  const value: AppContextType = {
    images,
    selectedImageIds,
    width,
    height,
    showLabels,
    removeImage,
    updateImage,
    toggleImageSelection,
    selectAllImages,
    clearSelection,
    reorderImages,
    setImages,
    setSelectedImageIds,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
