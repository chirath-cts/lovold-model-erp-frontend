export const buildOrderClause = (query, allowedColumns, fallbackColumn, fallbackDir = "ASC") => {
  const requestedSort = typeof query._sort === "string" ? query._sort : fallbackColumn;
  const sortColumn =
    allowedColumns[requestedSort] ??
    allowedColumns[fallbackColumn] ??
    Object.values(allowedColumns)[0];

  const requestedOrder =
    typeof query._order === "string" ? query._order.toUpperCase() : fallbackDir;
  const order = requestedOrder === "DESC" ? "DESC" : "ASC";

  return ` ORDER BY ${sortColumn} ${order}`;
};

export const sortArrayBy = (rows, sortBy, sortOrder = "asc") => {
  const order = sortOrder.toLowerCase() === "desc" ? -1 : 1;

  return [...rows].sort((a, b) => {
    const av = a[sortBy];
    const bv = b[sortBy];

    if (av === bv) return 0;
    if (av === null || av === undefined) return -1 * order;
    if (bv === null || bv === undefined) return 1 * order;

    if (typeof av === "number" && typeof bv === "number") {
      return av > bv ? order : -order;
    }

    return String(av).localeCompare(String(bv)) * order;
  });
};
