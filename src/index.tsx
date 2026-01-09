import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import type { ComparisonImage } from './domain/entities/ComparisonImage.ts'

// Per sviluppo locale, renderizza nell'elemento root
const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App />);
}

export interface ImageConfig {
  id?: string;
  url: string;
  label?: string;
  name?: string;
}

export interface ImagesComparatorConfig {
  /** Initial images to display */
  images?: ImageConfig[];
  /** Width of the comparison view (default: '100%') */
  width?: number | string;
  /** Height of the comparison view (default: 500) */
  height?: number | string;
  /** Show image labels (default: true) */
  showLabels?: boolean;
}

export interface ImagesComparatorEvents {
  onImageAdd?: (image: ComparisonImage) => void;
  onImageRemove?: (imageId: string) => void;
  onSliderChange?: (positions: number[]) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export type { ComparisonImage };

// Store per la comunicazione con React - Map per supportare multiple istanze
interface AppStore {
  images: ComparisonImage[];
  selectedIds: string[];
  width: number | string;
  height: number | string;
  showLabels: boolean;
  setImages: (images: ComparisonImage[]) => void;
  setSelectedIds: (ids: string[]) => void;
  events: ImagesComparatorEvents;
}

const storeRegistry = new Map<string, AppStore>();

export const setGlobalStore = (instanceId: string, store: AppStore) => {
  storeRegistry.set(instanceId, store);
};

export const getGlobalStore = (instanceId: string) => storeRegistry.get(instanceId);

export const removeGlobalStore = (instanceId: string) => {
  storeRegistry.delete(instanceId);
};

export class ImagesComparator {
  private root: ReturnType<typeof createRoot> | null = null;
  private config: Required<Omit<ImagesComparatorConfig, 'images'>> & { images: ImageConfig[] };
  private events: ImagesComparatorEvents;
  private mounted = false;
  private container: HTMLElement | null = null;
  readonly instanceId: string;

  constructor(containerId: string, config?: ImagesComparatorConfig, events?: ImagesComparatorEvents) {
    this.instanceId = crypto.randomUUID();
    
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container element with id "${containerId}" not found`);
    }
    this.container = element;
    
    this.config = {
      images: config?.images || [],
      width: config?.width ?? '100%',
      height: config?.height ?? 500,
      showLabels: config?.showLabels ?? true,
    };
    this.events = events || {};
    
    // Auto-mount on construction
    this.mount();
  }

  private get store(): AppStore | undefined {
    return storeRegistry.get(this.instanceId);
  }

  private mount(): void {
    if (this.mounted || !this.container) {
      return;
    }

    this.root = createRoot(this.container);
    this.root.render(
      <App 
        instanceId={this.instanceId}
        initialConfig={this.config}
        events={this.events}
      />
    );
    this.mounted = true;
  }

  unmount(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
      this.mounted = false;
      this.container = null;
      removeGlobalStore(this.instanceId);
    }
  }

  /** Add an image to the comparator */
  addImage(imageConfig: ImageConfig): void {
    if (!this.store) {
      console.warn('ImagesComparator is not mounted');
      return;
    }

    const newImage: ComparisonImage = {
      id: imageConfig.id || crypto.randomUUID(),
      name: imageConfig.name || this.extractNameFromUrl(imageConfig.url),
      url: imageConfig.url,
      label: imageConfig.label,
    };

    const currentImages = this.store.images;
    const exists = currentImages.some(img => img.id === newImage.id || img.url === newImage.url);
    
    if (!exists) {
      this.store.setImages([...currentImages, newImage]);
      // Auto-select new image
      this.store.setSelectedIds([...this.store.selectedIds, newImage.id]);
      this.events.onImageAdd?.(newImage);
    }
  }

  /** Add multiple images at once */
  addImages(images: ImageConfig[]): void {
    images.forEach(img => this.addImage(img));
  }

  /** Remove an image by ID */
  removeImage(imageId: string): void {
    if (!this.store) {
      console.warn('ImagesComparator is not mounted');
      return;
    }

    this.store.setImages(this.store.images.filter(img => img.id !== imageId));
    this.store.setSelectedIds(this.store.selectedIds.filter(id => id !== imageId));
    this.events.onImageRemove?.(imageId);
  }

  /** Clear all images */
  clearImages(): void {
    if (!this.store) {
      console.warn('ImagesComparator is not mounted');
      return;
    }

    this.store.setImages([]);
    this.store.setSelectedIds([]);
  }

  /** Get all images */
  getImages(): ComparisonImage[] {
    return this.store?.images || [];
  }

  /** Select images for comparison */
  selectImages(imageIds: string[]): void {
    if (!this.store) {
      console.warn('ImagesComparator is not mounted');
      return;
    }

    const validIds = imageIds.filter(id => 
      this.store!.images.some(img => img.id === id)
    );
    this.store.setSelectedIds(validIds);
  }

  /** Select all images */
  selectAll(): void {
    if (!this.store) return;
    this.store.setSelectedIds(this.store.images.map(img => img.id));
  }

  /** Clear selection */
  clearSelection(): void {
    if (!this.store) return;
    this.store.setSelectedIds([]);
  }

  /** Get selected image IDs */
  getSelectedIds(): string[] {
    return this.store?.selectedIds || [];
  }

  /** Update image label */
  updateImageLabel(imageId: string, label: string): void {
    if (!this.store) return;
    
    this.store.setImages(
      this.store.images.map(img => 
        img.id === imageId ? { ...img, label } : img
      )
    );
  }

  private extractNameFromUrl(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      const filename = pathname.split('/').pop() || 'image';
      return decodeURIComponent(filename);
    } catch {
      return 'image';
    }
  }
}

// Esponi globalmente per uso in browser
if (typeof window !== 'undefined') {
  (window as unknown as { ImagesComparator: typeof ImagesComparator }).ImagesComparator = ImagesComparator;
}

export default ImagesComparator;
