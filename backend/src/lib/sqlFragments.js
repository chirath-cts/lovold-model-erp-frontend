export const PRIMARY_SUPPLIER_JOIN_SQL = `
LEFT JOIN supplier_product sp
  ON sp.product_id = p.id
 AND sp.id = (
   SELECT sp2.id
   FROM supplier_product sp2
   WHERE sp2.product_id = p.id
   ORDER BY COALESCE(sp2.is_primary_supplier, 0) DESC, sp2.id ASC
   LIMIT 1
 )
`;
