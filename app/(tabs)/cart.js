import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useCartViewModel } from '../../viewmodels/useCartViewModel';

export default function CartScreen() {
  // Force light mode
  const colorScheme = 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  
  const {
    cartItems,
    cart,
    error,
    refreshing,
    isLoading,
    fetchCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    clearAllErrors
  } = useCartViewModel();

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (error) {
      Alert.alert('Lỗi', error, [
        { text: 'OK', onPress: clearAllErrors }
      ]);
    }
  }, [error, clearAllErrors]);

  const handleRefresh = async () => {
    try {
      await refreshCart();
    } catch (err) {
      console.error('Lỗi refresh giỏ hàng:', err);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setIsUpdating(true);
    try {
      await updateCartItemQuantity(itemId, newQuantity);
    } catch (err) {
      console.error('Lỗi cập nhật số lượng:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật số lượng sản phẩm');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCart(itemId);
            } catch (err) {
              console.error('Lỗi xóa sản phẩm:', err);
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
            }
          }
        }
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa tất cả', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart();
            } catch (err) {
              console.error('Lỗi xóa giỏ hàng:', err);
              Alert.alert('Lỗi', 'Không thể xóa giỏ hàng');
            }
          }
        }
      ]
    );
  };

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng trống');
      return;
    }
    
    // Navigate to checkout screen
    console.log('Navigate to checkout');
    Alert.alert('Thông báo', 'Chức năng thanh toán sẽ sớm có');
  };

  const calculateTotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => {
      return total + (item.totalPrice || 0);
    }, 0);
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      {/* Icon thay vì ảnh */}
      <View style={styles.itemIconContainer}>
        <View style={[styles.iconWrapper, { backgroundColor: theme.primary + '15' }]}>
          <Ionicons name="cube-outline" size={40} color={theme.primary} />
        </View>
      </View>
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.productName || 'Sản phẩm'}
        </Text>
        {item.productCode && (
          <Text style={styles.itemCode}>
            Mã: {item.productCode}
          </Text>
        )}
        <Text style={[styles.itemPrice, { color: theme.primary }]}>
          {item.unitPrice?.toLocaleString('vi-VN') || '0'} VNĐ
        </Text>
        
        <View style={styles.itemActions}>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={[styles.quantityBtn, { backgroundColor: theme.muted }]}
              onPress={() => handleUpdateQuantity(item._id, item.quantity - 1)}
              disabled={isUpdating}
            >
              <Ionicons name="remove" size={16} color={theme.primary} />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity 
              style={[styles.quantityBtn, { backgroundColor: theme.muted }]}
              onPress={() => handleUpdateQuantity(item._id, item.quantity + 1)}
              disabled={isUpdating}
            >
              <Ionicons name="add" size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.removeBtn}
            onPress={() => handleRemoveItem(item._id)}
            disabled={isUpdating}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color={theme.tabIconDefault} />
      <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
      <Text style={styles.emptySubtitle}>
        Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm
      </Text>
      <TouchableOpacity 
        style={styles.shopNowBtn}
        onPress={() => router.push('/(tabs)/product')}
      >
        <Text style={styles.shopNowText}>Mua sắm ngay</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!cartItems || cartItems.length === 0) return null;
    
    const total = calculateTotal();
    
    return (
      <View style={styles.footer}>
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalAmount}>
              {total.toLocaleString('vi-VN')} VNĐ
            </Text>
          </View>
          <Text style={styles.itemCount}>
            {cartItems.length} sản phẩm
          </Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.clearBtn}
            onPress={handleClearCart}
          >
            <Text style={styles.clearBtnText}>Xóa tất cả</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.checkoutBtn}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutBtnText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading && (!cartItems || cartItems.length === 0)) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Giỏ hàng</Text>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => router.push('/(tabs)/product')}
            >
              <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>
            {cartItems?.length || 0} sản phẩm trong giỏ hàng
          </Text>
        </View>

        {/* Cart Items */}
        {!cartItems || cartItems.length === 0 ? (
          renderEmptyCart()
        ) : (
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.cartList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderFooter}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  // Header styles
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerIcon: {
    padding: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  // Cart list styles
  cartList: {
    padding: 16,
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemIconContainer: {
    marginRight: 12,
    marginBottom: 12,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  itemCode: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  removeBtn: {
    padding: 8,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  shopNowBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Footer styles
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    padding: 16,
    marginTop: 16,
  },
  totalSection: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
  },
  itemCount: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  clearBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  checkoutBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
