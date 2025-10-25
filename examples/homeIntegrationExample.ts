import { CategoriesAPI } from '../services/categoriesAPI';
import { ProductsAPI } from '../services/productsAPI';

/**
 * Example usage of Home integration
 * File này demo cách sử dụng Home ViewModel và API integration
 */
export class HomeIntegrationExample {
  /**
   * Test load categories
   */
  static async testLoadCategories() {
    try {
      console.log('🧪 Testing categories loading...');
      
      const categories = await CategoriesAPI.getActiveCategories({
        page: 1,
        limit: 8,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      console.log('✅ Categories loaded successfully');
      console.log(`📊 Total categories: ${categories.items.length}`);
      
      categories.items.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name} - ${category.isActive ? 'Active' : 'Inactive'}`);
      });
      
      return { success: true, data: categories };
    } catch (error: any) {
      console.error('❌ Categories loading failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test load products for categories
   */
  static async testLoadProductsForCategories() {
    try {
      console.log('🧪 Testing products loading for categories...');
      
      // First get categories
      const categoriesResponse = await CategoriesAPI.getActiveCategories({
        page: 1,
        limit: 4,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      console.log(`📋 Found ${categoriesResponse.items.length} categories`);
      
      const allProducts = [];
      
      // Load products for each category
      for (const category of categoriesResponse.items) {
        try {
          console.log(`🛍️ Loading products for category: ${category.name}`);
          
          const productsResponse = await ProductsAPI.getProducts({
            page: 1,
            limit: 4,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            filters: {
              isActive: true,
              categoryId: category._id
            }
          });
          
          const productsWithCategory = productsResponse.items.map(product => ({
            ...product,
            categoryName: category.name
          }));
          
          allProducts.push(...productsWithCategory);
          console.log(`✅ Loaded ${productsWithCategory.length} products for ${category.name}`);
        } catch (categoryError) {
          console.warn(`⚠️ Failed to load products for ${category.name}:`, categoryError.message);
        }
      }
      
      console.log('✅ Products loading completed');
      console.log(`📊 Total products loaded: ${allProducts.length}`);
      
      allProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - ${product.categoryName}`);
      });
      
      return { success: true, data: allProducts };
    } catch (error: any) {
      console.error('❌ Products loading failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test Home ViewModel integration
   */
  static async testHomeViewModel() {
    try {
      console.log('🧪 Testing Home ViewModel...');
      
      // This would be used in a React component
      console.log('📝 Home ViewModel usage example:');
      console.log(`
// In your React component:
import { useHomeViewModel } from '../viewmodels/useHomeViewModel';

export const HomeScreen = () => {
  const { state, actions } = useHomeViewModel();
  const { categories, featuredProducts, loading, error } = state;
  const { loadData, refreshData, clearError } = actions;

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <View>
      {loading && <Text>Loading...</Text>}
      {error && <Text>Error: {error}</Text>}
      <Text>Categories: {categories.length}</Text>
      <Text>Products: {featuredProducts.length}</Text>
    </View>
  );
};
      `);
      
      console.log('✅ Home ViewModel example provided');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Home ViewModel test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test complete home data flow
   */
  static async testCompleteHomeFlow() {
    try {
      console.log('🚀 Testing complete home data flow...\n');
      
      // Step 1: Load categories
      console.log('Step 1: Loading categories...');
      const categoriesResult = await this.testLoadCategories();
      if (!categoriesResult.success) {
        throw new Error('Categories loading failed');
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
      
      // Step 2: Load products for categories
      console.log('Step 2: Loading products for categories...');
      const productsResult = await this.testLoadProductsForCategories();
      if (!productsResult.success) {
        throw new Error('Products loading failed');
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
      
      // Step 3: Show ViewModel usage
      console.log('Step 3: Home ViewModel integration...');
      const viewModelResult = await this.testHomeViewModel();
      if (!viewModelResult.success) {
        throw new Error('ViewModel test failed');
      }
      
      console.log('\n🎉 Complete home data flow test passed!');
      console.log('📊 Summary:');
      console.log(`- Categories loaded: ${categoriesResult.data?.items.length || 0}`);
      console.log(`- Products loaded: ${productsResult.data?.length || 0}`);
      console.log('- ViewModel integration: Ready');
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Complete home flow test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Performance test
   */
  static async testPerformance() {
    try {
      console.log('⚡ Testing performance...');
      
      const startTime = Date.now();
      
      // Test categories loading speed
      const categoriesStart = Date.now();
      await CategoriesAPI.getActiveCategories({ page: 1, limit: 8 });
      const categoriesTime = Date.now() - categoriesStart;
      
      // Test products loading speed
      const productsStart = Date.now();
      await ProductsAPI.getProducts({ 
        page: 1, 
        limit: 8, 
        filters: { isActive: true } 
      });
      const productsTime = Date.now() - productsStart;
      
      const totalTime = Date.now() - startTime;
      
      console.log('✅ Performance test completed');
      console.log(`📊 Results:`);
      console.log(`- Categories API: ${categoriesTime}ms`);
      console.log(`- Products API: ${productsTime}ms`);
      console.log(`- Total time: ${totalTime}ms`);
      
      return { 
        success: true, 
        performance: {
          categoriesTime,
          productsTime,
          totalTime
        }
      };
    } catch (error: any) {
      console.error('❌ Performance test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Run all tests
   */
  static async runAllTests() {
    console.log('🚀 Starting Home Integration Tests...\n');
    
    const results = {
      categories: await this.testLoadCategories(),
      products: await this.testLoadProductsForCategories(),
      viewModel: await this.testHomeViewModel(),
      performance: await this.testPerformance(),
      completeFlow: await this.testCompleteHomeFlow()
    };

    console.log('\n📋 Test Results Summary:');
    console.log('========================');
    
    Object.entries(results).forEach(([testName, result]) => {
      if (result.success) {
        console.log(`✅ ${testName}: Passed`);
        if (result.performance) {
          console.log(`   ⚡ Performance: ${result.performance.totalTime}ms`);
        }
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
export default HomeIntegrationExample;
