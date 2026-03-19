import { badRequestError } from "../lib/appError.js";
import { mapCategory } from "../mappers/categoryMapper.js";

export function createCategoryService({ categoryRepository }) {
  return {
    async listCategories() {
      const rows = await categoryRepository.listCategories();
      return rows.map(mapCategory);
    },
    async createCategory(payload) {
      const { id, name, description } = payload ?? {};
      if (!id || !name) throw badRequestError("id and name are required");

      await categoryRepository.createCategory({ id, name, description });
      const row = await categoryRepository.getCategoryById(id);
      return mapCategory(row);
    },
  };
}
