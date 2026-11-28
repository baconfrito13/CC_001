/** The one thing the SQL test harnesses need from a database: run a statement, get rows. */
export interface SqlRunner {
  query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
}
