/**
 * Represents an image that can be compared
 */
export interface ComparisonImage {
  id: string;
  name: string;
  url: string;
  label?: string;
  metadata?: ImageMetadata;
}

export interface ImageMetadata {
  width?: number;
  height?: number;
  size?: number;
  format?: string;
  createdAt?: Date;
}

/**
 * Factory function to create a ComparisonImage
 */
export const createComparisonImage = (
  id: string,
  name: string,
  url: string,
  label?: string,
  metadata?: ImageMetadata
): ComparisonImage => ({
  id,
  name,
  url,
  label,
  metadata,
});
