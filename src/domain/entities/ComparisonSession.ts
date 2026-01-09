/**
 * Represents a comparison session containing multiple images
 */
export interface ComparisonSession {
  id: string;
  name: string;
  imageIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Factory function to create a ComparisonSession
 */
export const createComparisonSession = (
  id: string,
  name: string,
  imageIds: string[] = []
): ComparisonSession => ({
  id,
  name,
  imageIds,
  createdAt: new Date(),
  updatedAt: new Date(),
});
