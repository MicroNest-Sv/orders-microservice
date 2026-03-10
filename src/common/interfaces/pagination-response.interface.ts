export interface PaginationMeta {
  page: number;
  perPage: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  pagination: PaginationMeta;
  data: T[];
}
