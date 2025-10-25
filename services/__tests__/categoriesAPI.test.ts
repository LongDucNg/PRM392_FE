import type { CategoriesQueryParams } from '../../models';
import { CategoriesAPI } from '../categoriesAPI';

/**
 * Test file for CategoriesAPI
 * Chạy test này để kiểm tra API service hoạt động
 */
export class CategoriesAPITest {
  /**
   * Test lấy danh sách categories
   */
  static async testGetCategories() {
    try {
      console.log('🧪 Testing getCategories...');
      
      const params: CategoriesQueryParams = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      const result = await CategoriesAPI.getCategories(params);
      
      console.log('✅ getCategories test passed');
      console.log('📊 Result:', {
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        totalPages: result.meta.totalPages,
        itemsCount: result.items.length
      });
      
      return { success: true, data: result };
    } catch (error: any) {
      console.error('❌ getCategories test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test lấy categories đang hoạt động
   */
  static async testGetActiveCategories() {
    try {
      console.log('🧪 Testing getActiveCategories...');
      
      const result = await CategoriesAPI.getActiveCategories({
        page: 1,
        limit: 5
      });
      
      console.log('✅ getActiveCategories test passed');
      console.log('📊 Active categories:', result.items.length);
      
      return { success: true, data: result };
    } catch (error: any) {
      console.error('❌ getActiveCategories test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test tìm kiếm categories
   */
  static async testSearchCategories() {
    try {
      console.log('🧪 Testing searchCategories...');
      
      const result = await CategoriesAPI.searchCategories('test', {
        page: 1,
        limit: 5
      });
      
      console.log('✅ searchCategories test passed');
      console.log('📊 Search results:', result.items.length);
      
      return { success: true, data: result };
    } catch (error: any) {
      console.error('❌ searchCategories test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test lấy category by ID (nếu có data)
   */
  static async testGetCategoryById(categoryId?: string) {
    try {
      if (!categoryId) {
        console.log('⚠️ Skipping getCategoryById test - no category ID provided');
        return { success: true, skipped: true };
      }

      console.log('🧪 Testing getCategoryById...');
      
      const result = await CategoriesAPI.getCategoryById(categoryId);
      
      console.log('✅ getCategoryById test passed');
      console.log('📊 Category:', result.name);
      
      return { success: true, data: result };
    } catch (error: any) {
      console.error('❌ getCategoryById test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Chạy tất cả tests
   */
  static async runAllTests() {
    console.log('🚀 Starting CategoriesAPI tests...\n');
    
    const results = {
      getCategories: await this.testGetCategories(),
      getActiveCategories: await this.testGetActiveCategories(),
      searchCategories: await this.testSearchCategories(),
      getCategoryById: await this.testGetCategoryById()
    };

    console.log('\n📋 Test Results Summary:');
    console.log('========================');
    
    Object.entries(results).forEach(([testName, result]) => {
      if (result.skipped) {
        console.log(`⏭️  ${testName}: Skipped`);
      } else if (result.success) {
        console.log(`✅ ${testName}: Passed`);
      } else {
        console.log(`❌ ${testName}: Failed - ${result.error}`);
      }
    });

    const passedTests = Object.values(results).filter(r => r.success).length;
    const totalTests = Object.values(results).length;
    
    console.log(`\n🎯 Tests passed: ${passedTests}/${totalTests}`);
    
    return results;
  }
}

// Export để có thể import và sử dụng
export default CategoriesAPITest;
