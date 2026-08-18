export function renderPagination(page: number, pageSize: number, allItemsN: number) {
  return allItemsN > page * pageSize;
}
