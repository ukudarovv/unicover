export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

