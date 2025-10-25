import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'processing': return '#2196f3';
      case 'shipped': return '#9c27b0';
      case 'delivered': return '#4caf50';
      case 'cancelled': return '#f44336';
       default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đã giao hàng';
      case 'delivered': return 'Đã nhận hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending': return '#ff9800';
      case 'paid': return '#4caf50';
      case 'failed': return '#f44336';
       default: return '#666';
    }
  };

  const getPaymentStatusText = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending': return 'Chờ thanh toán';
      case 'paid': return 'Đã thanh toán';
      case 'failed': return 'Thanh toán thất bại';
      default: return paymentStatus;
    }
  };

  const renderOrderItem = (order) => (
    <TouchableOpacity 
      key={order._id} 
      style={styles.orderItem}
      onPress={() => setSelectedOrder(order)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Đơn hàng: {order._id.slice(-8)}</Text>
        <Text style={styles.orderDate}>
          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
        </Text>
      </View>
      
      <View style={styles.orderInfo}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Trạng thái:</Text>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusText(order.status)}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Thanh toán:</Text>
          <Text style={[styles.statusText, { color: getPaymentStatusColor(order.paymentStatus) }]}>
            {getPaymentStatusText(order.paymentStatus)}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Tổng tiền:</Text>
          <Text style={styles.totalAmount}>
            {order.totalAmount.toLocaleString('vi-VN')} VNĐ
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Số lượng sản phẩm:</Text>
          <Text style={styles.itemCount}>
            {order.items?.length || 0} sản phẩm
          </Text>
        </View>
      </View>
      
      {order.shippingAddress && (
        <View style={styles.shippingInfo}>
          <Text style={styles.shippingLabel}>Địa chỉ giao hàng:</Text>
          <Text style={styles.shippingText}>{order.shippingAddress}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderOrderDetail = (order) => (
    <View style={styles.orderDetail}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>Chi tiết đơn hàng</Text>
        <TouchableOpacity 
          style={styles.closeBtn}
          onPress={() => setSelectedOrder(null)}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.detailContent}>
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
          <Text style={styles.detailText}>ID: {order._id}</Text>
          <Text style={styles.detailText}>
            Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}
          </Text>
          <Text style={styles.detailText}>
            Cập nhật: {new Date(order.updatedAt).toLocaleString('vi-VN')}
          </Text>
        </View>
        
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Trạng thái</Text>
          <Text style={styles.detailText}>
            Đơn hàng: {getStatusText(order.status)}
          </Text>
          <Text style={styles.detailText}>
            Thanh toán: {getPaymentStatusText(order.paymentStatus)}
          </Text>
          <Text style={styles.detailText}>
            Phương thức: {order.paymentMethod}
          </Text>
        </View>
        
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          <Text style={styles.detailText}>SĐT: {order.shippingPhone}</Text>
          <Text style={styles.detailText}>Địa chỉ: {order.shippingAddress}</Text>
          {order.note && (
            <Text style={styles.detailText}>Ghi chú: {order.note}</Text>
          )}
        </View>
        
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Tổng tiền</Text>
          <Text style={styles.detailText}>
            Tổng giá: {order.totalPrice.toLocaleString('vi-VN')} VNĐ
          </Text>
          <Text style={styles.detailText}>
            Giảm giá: {order.discount.toLocaleString('vi-VN')} VNĐ
          </Text>
          <Text style={[styles.detailText, styles.finalAmount]}>
            Thành tiền: {order.totalAmount.toLocaleString('vi-VN')} VNĐ
          </Text>
        </View>
        
        {order.items && order.items.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Sản phẩm ({order.items.length})</Text>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemDetail}>
                <Text style={styles.itemDetailText}>
                  Sản phẩm: {item.productId}
                </Text>
                <Text style={styles.itemDetailText}>
                  Biến thể: {item.productVariantId}
                </Text>
                <Text style={styles.itemDetailText}>
                  Số lượng: {item.quantity}
                </Text>
                <Text style={styles.itemDetailText}>
                  Giá: {item.basePrice.toLocaleString('vi-VN')} VNĐ
                </Text>
                <Text style={styles.itemDetailText}>
                  Thành tiền: {item.totalPrice.toLocaleString('vi-VN')} VNĐ
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );

  if (isLoading && (!orders || orders.length === 0)) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Đơn hàng</Text>
          <Text style={styles.subtitle}>
            {orders?.length || 0} đơn hàng
          </Text>
        </View>

        {!orders || orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
            <Text style={styles.emptySubtext}>
              Hãy mua sắm và tạo đơn hàng đầu tiên của bạn
            </Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.ordersList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            {orders?.map(renderOrderItem) || []}
          </ScrollView>
        )}

        {selectedOrder && renderOrderDetail(selectedOrder)}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  container: { 
    flex: 1 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000'
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#000'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  ordersList: {
    flex: 1
  },
  orderItem: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000'
  },
  orderDate: {
    fontSize: 14,
    color: '#666'
  },
  orderInfo: {
    marginBottom: 10
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  statusLabel: {
    fontSize: 14,
    color: '#666'
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827'
  },
  itemCount: {
    fontSize: 14,
    color: '#000'
  },
  shippingInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  shippingLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4
  },
  shippingText: {
    fontSize: 14,
    color: '#666'
  },
  orderDetail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  closeBtn: {
    width: 30,
    height: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeBtnText: {
    fontSize: 16,
    color: '#000'
  },
  detailContent: {
    flex: 1,
    padding: 20
  },
  detailSection: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10
  },
  detailText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 5
  },
  finalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827'
  },
  itemDetail: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10
  },
  itemDetailText: {
    fontSize: 12,
    color: '#000',
    marginBottom: 2
  }
});
