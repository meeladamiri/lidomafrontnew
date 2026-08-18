export function renderSearchPagination(page: number, pageSize: number, allItemsN: number) {
  return allItemsN > (page - 1) * pageSize;
}
