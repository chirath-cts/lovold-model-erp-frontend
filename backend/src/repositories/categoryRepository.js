export function createCategoryRepository(db) {
  return {
    listCategories() {
      return db.all("SELECT id, name, description FROM categories ORDER BY name ASC");
    },
    createCategory({ id, name, description }) {
      return db.run(
        "INSERT INTO categories (id, name, description) VALUES (?, ?, ?)",
        id,
        name,
        description ?? null,
      );
    },
    getCategoryById(id) {
      return db.get("SELECT id, name, description FROM categories WHERE id = ?", id);
    },
    existsById(id) {
      return db.get("SELECT id FROM categories WHERE id = ?", id);
    },
  };
}
