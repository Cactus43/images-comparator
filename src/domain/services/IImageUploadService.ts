import type { ComparisonImage } from '../entities/ComparisonImage.ts';

export interface IImageUploadService {
  uploadImage(file: File): Promise<ComparisonImage>;
  uploadFromUrl(url: string, name?: string): Promise<ComparisonImage>;
  validateImage(file: File): boolean;
}
