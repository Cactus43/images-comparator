import type { ComparisonSession } from '../entities/ComparisonSession.ts';

export interface ISessionRepository {
  getAll(): ComparisonSession[];
  getById(id: string): ComparisonSession | undefined;
  add(session: ComparisonSession): void;
  update(id: string, session: ComparisonSession): void;
  remove(id: string): void;
  getCurrent(): ComparisonSession | undefined;
  setCurrent(id: string): void;
}
