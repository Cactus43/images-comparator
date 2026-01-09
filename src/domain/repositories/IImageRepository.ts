import type { ComparisonImage } from '../entities/ComparisonImage.ts';

export interface IImageRepository {
  getAll(): ComparisonImage[];
  getById(id: string): ComparisonImage | undefined;
  add(image: ComparisonImage): void;
  update(id: string, image: ComparisonImage): void;
  remove(id: string): void;
  getByIds(ids: string[]): ComparisonImage[];
}
