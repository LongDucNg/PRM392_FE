import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useCartViewModel } from '../../viewmodels/useCartViewModel';

export default function OrdersScreen() {
  // Force light mode
  const colorScheme = 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  
  const {
    orders,
    error,
    refreshing,
    isLoading,
    isFetchingOrders,
    fetchOrders,
    refreshCart,
    clearAllErrors
  } = useCartViewModel();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Lỗi', error, [
        { text: 'OK', onPress: clearAllErrors }
      ]);
    }
  }, [error]);

  const handleRefresh = async () => {
    try {
      await fetchOrders();
    } catch (err) {
      console.error('Lỗi refresh đơn hàng:', err);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': 
        return { 
          text: 'Chờ xử lý', 
          color: '#F59E0B', 
          bgColor: '#FEF3C7',
          icon: 'time-outline'
        };
      case 'processing': 
        return { 
          text: 'Đang xử lý', 
          color: '#3B82F6', 
          bgColor: '#DBEAFE',
          icon: 'cog-outline'
        };
      case 'shipped': 
        return { 
          text: 'Đang giao', 
          color: '#8B5CF6', 
          bgColor: '#EDE9FE',
          icon: 'car-outline'
        };
      case 'delivered': 
        return { 
          text: 'Đã nhận', 
          color: '#10B981', 
          bgColor: '#D1FAE5',
          icon: 'checkmark-circle-outline'
        };
      case 'cancelled': 
        return { 
          text: 'Đã hủy', 
          color: '#EF4444', 
          bgColor: '#FEE2E2',
          icon: 'close-circle-outline'
        };
      default: 
        return { 
          text: status, 
          color: '#6B7280', 
          bgColor: '#F3F4F6',
          icon: 'help-circle-outline'
        };
    }
  };

  const getPaymentStatusInfo = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending': 
        return { 
          text: 'Chờ thanh toán', 
          color: '#F59E0B', 
          bgColor: '#FEF3C7',
          icon: 'time-outline'
        };
      case 'paid': 
        return { 
          text: 'Đã thanh toán', 
          color: '#10B981', 
          bgColor: '#D1FAE5',
          icon: 'checkmark-circle-outline'
        };
      case 'failed': 
        return { 
          text: 'Thất bại', 
          color: '#EF4444', 
          bgColor: '#FEE2E2',
          icon: 'close-circle-outline'
        };
      default: 
        return { 
          text: paymentStatus, 
          color: '#6B7280', 
          bgColor: '#F3F4F6',
          icon: 'help-circle-outline'
        };
    }
  };

  const renderOrderItem = ({ item: order }) => {
    const statusInfo = getStatusInfo(order.status);
    const paymentInfo = getPaymentStatusInfo(order.paymentStatus);
    
    return (
      <TouchableOpacity 
        style={[styles.orderCard, { backgroundColor: theme.background, borderColor: theme.muted }]}
        onPress={() => {
          setSelectedOrder(order);
          setShowDetailModal(true);
        }}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <Ionicons name="receipt-outline" size={20} color={theme.primary} />
            <Text style={[styles.orderId, { color: theme.text }]}>
              #{order._id.slice(-8).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.orderDate, { color: theme.tabIconDefault }]}>
            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>

        {/* Status Badges */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: paymentInfo.bgColor }]}>
            <Ionicons name={paymentInfo.icon} size={16} color={paymentInfo.color} />
            <Text style={[styles.statusText, { color: paymentInfo.color }]}>
              {paymentInfo.text}
            </Text>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.orderInfo}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="bag-outline" size={16} color={theme.tabIconDefault} />
              <Text style={[styles.infoText, { color: theme.tabIconDefault }]}>
                {order.items?.length || 0} sản phẩm
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={16} color={theme.primary} />
              <Text style={[styles.totalAmount, { color: theme.primary }]}>
                {order.totalAmount.toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.detailButton, { borderColor: theme.primary }]}
            onPress={() => {
              setSelectedOrder(order);
              setShowDetailModal(true);
            }}
          >
            <Text style={[styles.detailButtonText, { color: theme.primary }]}>
              Xem chi tiết
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOrderDetailModal = () => {
    if (!selectedOrder) return null;
    
    const statusInfo = getStatusInfo(selectedOrder.status);
    const paymentInfo = getPaymentStatusInfo(selectedOrder.paymentStatus);
    
    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.muted }]}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDetailModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Chi tiết đơn hàng</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Order Info Card */}
            <View style={[styles.infoCard, { backgroundColor: theme.background, borderColor: theme.muted }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="receipt-outline" size={24} color={theme.primary} />
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  #{selectedOrder._id.slice(-8).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.orderDate, { color: theme.tabIconDefault }]}>
                {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
              </Text>
            </View>

            {/* Status Cards */}
            <View style={styles.statusCards}>
              <View style={[styles.statusCard, { backgroundColor: statusInfo.bgColor }]}>
                <Ionicons name={statusInfo.icon} size={24} color={statusInfo.color} />
                <View style={styles.statusCardContent}>
                  <Text style={[styles.statusCardTitle, { color: statusInfo.color }]}>
                    Trạng thái đơn hàng
                  </Text>
                  <Text style={[styles.statusCardText, { color: statusInfo.color }]}>
                    {statusInfo.text}
                  </Text>
                </View>
              </View>

              <View style={[styles.statusCard, { backgroundColor: paymentInfo.bgColor }]}>
                <Ionicons name={paymentInfo.icon} size={24} color={paymentInfo.color} />
                <View style={styles.statusCardContent}>
                  <Text style={[styles.statusCardTitle, { color: paymentInfo.color }]}>
                    Thanh toán
                  </Text>
                  <Text style={[styles.statusCardText, { color: paymentInfo.color }]}>
                    {paymentInfo.text}
                  </Text>
                </View>
              </View>
            </View>

            {/* Order Summary */}
            <View style={[styles.summaryCard, { backgroundColor: theme.background, borderColor: theme.muted }]}>
              <Text style={[styles.summaryTitle, { color: theme.text }]}>Tóm tắt đơn hàng</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.tabIconDefault }]}>Số sản phẩm:</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {selectedOrder.items?.length || 0} sản phẩm
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.tabIconDefault }]}>Tổng tiền:</Text>
                <Text style={[styles.summaryValue, { color: theme.primary }]}>
                  {selectedOrder.totalAmount.toLocaleString('vi-VN')} VNĐ
                </Text>
              </View>
            </View>

            {/* Shipping Info */}
            {selectedOrder.shippingAddress && (
              <View style={[styles.shippingCard, { backgroundColor: theme.background, borderColor: theme.muted }]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="location-outline" size={24} color={theme.primary} />
                  <Text style={[styles.cardTitle, { color: theme.text }]}>Địa chỉ giao hàng</Text>
                </View>
                <Text style={[styles.shippingText, { color: theme.text }]}>
                  {selectedOrder.shippingAddress}
                </Text>
                {selectedOrder.shippingPhone && (
                  <Text style={[styles.shippingPhone, { color: theme.tabIconDefault }]}>
                    {selectedOrder.shippingPhone}
                  </Text>
                )}
              </View>
            )}

            {/* Products List */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <View style={[styles.productsCard, { backgroundColor: theme.background, borderColor: theme.muted }]}>
                <Text style={[styles.productsTitle, { color: theme.text }]}>
                  Sản phẩm ({selectedOrder.items.length})
                </Text>
                {selectedOrder.items.map((item, index) => (
                  <View key={index} style={[styles.productItem, { borderColor: theme.muted }]}>
                    <View style={styles.productInfo}>
                      <Text style={[styles.productName, { color: theme.text }]}>
                        Sản phẩm #{item.productId.slice(-6)}
                      </Text>
                      <Text style={[styles.productDetails, { color: theme.tabIconDefault }]}>
                        Số lượng: {item.quantity} • {item.basePrice.toLocaleString('vi-VN')} VNĐ
                      </Text>
                    </View>
                    <Text style={[styles.productTotal, { color: theme.primary }]}>
                      {item.totalPrice.toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="receipt-outline" size={80} color={theme.tabIconDefault} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        Chưa có đơn hàng nào
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.tabIconDefault }]}>
        Hãy mua sắm và tạo đơn hàng đầu tiên của bạn
      </Text>
      <TouchableOpacity 
        style={[styles.shopButton, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/(tabs)/product')}
      >
        <Ionicons name="storefront-outline" size={20} color="white" />
        <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && (!orders || orders.length === 0)) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Đang tải đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.muted }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Đơn hàng</Text>
            <Text style={[styles.headerSubtitle, { color: theme.tabIconDefault }]}>
              {orders?.length || 0} đơn hàng
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <Ionicons name="cart-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {!orders || orders.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.ordersList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Order Detail Modal */}
        {renderOrderDetailModal()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
  },
  container: { 
    flex: 1,
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
    fontWeight: '500',
  },
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerIcon: {
    padding: 8,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Orders list styles
  ordersList: {
    padding: 16,
  },
  // Order card styles
  orderCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
  },
  orderDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Status styles
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Order info styles
  orderInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  // Action styles
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  detailButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  // Card styles
  infoCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  // Status cards
  statusCards: {
    gap: 12,
    marginBottom: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  statusCardContent: {
    flex: 1,
  },
  statusCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusCardText: {
    fontSize: 16,
    fontWeight: '700',
  },
  // Summary card
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Shipping card
  shippingCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  shippingText: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  shippingPhone: {
    fontSize: 14,
    marginTop: 4,
  },
  // Products card
  productsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 14,
  },
  productTotal: {
    fontSize: 16,
    fontWeight: '700',
  },
});
