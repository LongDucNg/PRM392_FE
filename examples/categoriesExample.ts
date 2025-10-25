import type { CategoriesQueryParams } from '../models';
import { CategoriesAPI } from '../services/categoriesAPI';

/**
 * Example usage of CategoriesAPI
 * File này demo cách sử dụng CategoriesAPI trong ứng dụng
 */
export class CategoriesExample {
  /**
   * Example: Lấy danh sách tất cả categories
   */
  static async getAllCategories() {
    try {
      console.log('📋 Getting all categories...');
      
      const categories = await CategoriesAPI.getCategories();
      
      console.log('✅ Categories loaded successfully');
      console.log(`📊 Total categories: ${categories.meta.total}`);
      console.log(`📄 Page: ${categories.meta.page}/${categories.meta.totalPages}`);
      
      return categories;
    } catch (error: any) {
      console.error('❌ Failed to load categories:', error.message);
      throw error;
    }
  }

  /**
   * Example: Lấy categories với phân trang
   */
  static async getCategoriesWithPagination(page: number = 1, limit: number = 5) {
    try {
      console.log(`📋 Getting categories - Page ${page}, Limit ${limit}...`);
      
      const params: CategoriesQueryParams = {
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      const categories = await CategoriesAPI.getCategories(params);
      
      console.log('✅ Categories loaded successfully');
      console.log(`📊 Showing ${categories.items.length} of ${categories.meta.total} categories`);
      
      return categories;
    } catch (error: any) {
      console.error('❌ Failed to load categories:', error.message);
      throw error;
    }
  }

  /**
   * Example: Lấy chỉ categories đang hoạt động
   */
  static async getActiveCategories() {
    try {
      console.log('📋 Getting active categories...');
      
      const categories = await CategoriesAPI.getActiveCategories({
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      console.log('✅ Active categories loaded successfully');
      console.log(`📊 Active categories: ${categories.items.length}`);
      
      // Log category names
      categories.items.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name} (${category.isActive ? 'Active' : 'Inactive'})`);
      });
      
      return categories;
    } catch (error: any) {
      console.error('❌ Failed to load active categories:', error.message);
      throw error;
    }
  }

  /**
   * Example: Tìm kiếm categories
   */
  static async searchCategories(searchTerm: string) {
    try {
      console.log(`🔍 Searching categories for: "${searchTerm}"...`);
      
      const categories = await CategoriesAPI.searchCategories(searchTerm, {
        page: 1,
        limit: 10
      });
      
      console.log('✅ Search completed successfully');
      console.log(`📊 Found ${categories.items.length} categories matching "${searchTerm}"`);
      
      // Log search results
      categories.items.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name} - ${category.description}`);
      });
      
      return categories;
    } catch (error: any) {
      console.error('❌ Search failed:', error.message);
      throw error;
    }
  }

  /**
   * Example: Lấy chi tiết một category
   */
  static async getCategoryDetails(categoryId: string) {
    try {
      console.log(`📋 Getting category details for ID: ${categoryId}...`);
      
      const category = await CategoriesAPI.getCategoryById(categoryId);
      
      console.log('✅ Category details loaded successfully');
      console.log('📊 Category info:', {
        name: category.name,
        description: category.description,
        slug: category.slug,
        isActive: category.isActive,
        createdAt: category.createdAt
      });
      
      return category;
    } catch (error: any) {
      console.error('❌ Failed to load category details:', error.message);
      throw error;
    }
  }

  /**
   * Example: Sử dụng trong React component
   */
  static getReactComponentExample() {
    return `
// Example usage in React component
import React, { useState, useEffect } from 'react';
import { CategoriesAPI } from '../services/categoriesAPI';
import type { Category, CategoriesResponse } from '../models';

export const CategoriesList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response: CategoriesResponse = await CategoriesAPI.getActiveCategories({
          page: 1,
          limit: 20,
          sortBy: 'name',
          sortOrder: 'asc'
        });
        setCategories(response.items);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Categories ({categories.length})</h2>
      {categories.map(category => (
        <div key={category._id}>
          <h3>{category.name}</h3>
          <p>{category.description}</p>
          <span>{category.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      ))}
    </div>
  );
};
    `;
  }

  /**
   * Chạy tất cả examples
   */
  static async runAllExamples() {
    console.log('🚀 Running CategoriesAPI Examples...\n');
    
    try {
      // Example 1: Get all categories
      await this.getAllCategories();
      console.log('\n' + '='.repeat(50) + '\n');
      
      // Example 2: Get categories with pagination
      await this.getCategoriesWithPagination(1, 3);
      console.log('\n' + '='.repeat(50) + '\n');
      
      // Example 3: Get active categories
      await this.getActiveCategories();
      console.log('\n' + '='.repeat(50) + '\n');
      
      // Example 4: Search categories
      await this.searchCategories('test');
      console.log('\n' + '='.repeat(50) + '\n');
      
      console.log('✅ All examples completed successfully!');
      
    } catch (error: any) {
      console.error('❌ Examples failed:', error.message);
    }
  }
}

// Export để có thể import và sử dụng
export default CategoriesExample;
