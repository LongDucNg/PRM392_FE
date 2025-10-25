import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';

// Mock data categories
const categories = [
  { id: '1', name: 'RAM laptop', icon: '💾' },
  { id: '2', name: 'PC', icon: '🖥️' },
  { id: '3', name: 'Ổ cứng SSD di động', icon: '💿' },
  { id: '4', name: 'Ổ cứng HDD di động', icon: '💽' },
];

// Mock data sản phẩm
const mockProducts = [
  {
    id: '1',
    name: 'Arduino Uno R3',
    price: 150000,
    image: 'https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=Arduino',
    category: 'Module Arduino/Raspberry Pi',
    rating: 4.8,
    reviews: 124,
  },
  {
    id: '2',
    name: 'Raspberry Pi 4 Model B',
    price: 1200000,
    image: 'https://via.placeholder.com/200x200/4ECDC4/FFFFFF?text=Raspberry',
    category: 'Module Arduino/Raspberry Pi',
    rating: 4.9,
    reviews: 89,
  },
  {
    id: '3',
    name: 'Cảm biến nhiệt độ DHT22',
    price: 85000,
    image: 'https://via.placeholder.com/200x200/45B7D1/FFFFFF?text=DHT22',
    category: 'Cảm biến',
    rating: 4.7,
    reviews: 156,
  },
  {
    id: '4',
    name: 'Module Relay 4 kênh',
    price: 120000,
    image: 'https://via.placeholder.com/200x200/96CEB4/FFFFFF?text=Relay',
    category: 'Module Arduino/Raspberry Pi',
    rating: 4.6,
    reviews: 78,
  },
  {
    id: '5',
    name: 'IC 555 Timer',
    price: 15000,
    image: 'https://via.placeholder.com/200x200/FFEAA7/FFFFFF?text=IC555',
    category: 'IC & Vi điều khiển',
    rating: 4.5,
    reviews: 203,
  },
  {
    id: '6',
    name: 'Resistor 1KΩ (100 cái)',
    price: 25000,
    image: 'https://via.placeholder.com/200x200/DDA0DD/FFFFFF?text=Resistor',
    category: 'Linh kiện cơ bản',
    rating: 4.4,
    reviews: 167,
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: 'white' }]}
      onPress={() => {
        // Navigate to products with filter
        console.log('Navigate to category:', item.name);
      }}
    >
      <View style={styles.categoryIconContainer}>
        <Text style={styles.categoryIcon}>{item.icon}</Text>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={[styles.productCard, { backgroundColor: theme.background }]}
      onPress={() => {
        // Navigate to product detail
        console.log('Navigate to product:', item.name);
      }}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewsText}>({item.reviews})</Text>
        </View>
        <Text style={[styles.productPrice, { color: theme.primary }]}>
          {item.price.toLocaleString('vi-VN')} ₫
        </Text>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={() => router.push('/(tabs)/cart')}
        >
          <Ionicons name="add" size={16} color="white" />
          <Text style={styles.addToCartText}>Giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.shopName, { color: theme.text }]}>ElectroStore</Text>
          <Text style={[styles.shopSubtitle, { color: theme.tabIconDefault }]}>Linh kiện điện tử</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <Ionicons name="cart-outline" size={24} color={theme.text} />
            <View style={styles.cartBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="person-circle-outline" size={32} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Danh mục nổi bật</Text>
          <View style={styles.sectionSubtitle}>
            <Text style={[styles.sectionSubtitleText, { color: theme.tabIconDefault }]}>Khám phá sản phẩm</Text>
          </View>
        </View>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Featured Products Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Sản phẩm nổi bật</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: theme.primary }]}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={mockProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.productsList}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerTitle, { color: theme.text }]}>Liên kết nhanh</Text>
        <View style={styles.footerLinks}>
          <TouchableOpacity style={styles.footerLink}>
            <Ionicons name="headset-outline" size={20} color={theme.primary} />
            <Text style={[styles.footerLinkText, { color: theme.text }]}>CSKH</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLink}>
            <Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} />
            <Text style={[styles.footerLinkText, { color: theme.text }]}>Bảo hành</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLink}>
            <Ionicons name="call-outline" size={20} color={theme.primary} />
            <Text style={[styles.footerLinkText, { color: theme.text }]}>Liên hệ</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  shopName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  shopSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  avatarContainer: {
    padding: 4,
  },
  // Section styles
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    marginBottom: 16,
  },
  sectionSubtitleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Categories styles
  categoriesList: {
    paddingBottom: 8,
  },
  categoryCard: {
    flex: 1,
    margin: 6,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    color: '#2c3e50',
  },
  // Products styles
  productsList: {
    paddingBottom: 8,
  },
  productCard: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#333',
  },
  reviewsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addToCartText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Footer styles
  footer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  footerLink: {
    alignItems: 'center',
    gap: 8,
  },
  footerLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});


