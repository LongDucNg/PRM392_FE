import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

function TabBarIcon({ name, color, focused }) {
  return (
    <Ionicons 
      name={focused ? name : `${name}-outline`} 
      size={24} 
      color={color}
      style={{ marginBottom: -3 }}
    />
  );
}

export default function TabLayout() {
  // Force light mode
  const colorScheme = 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="product"
        options={{
          title: 'Sản phẩm',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="storefront" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen 
        name="orders" 
        options={{ 
          title: 'Đơn hàng',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="receipt" color={color} focused={focused} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Cài đặt',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="settings" color={color} focused={focused} /> 
        }} 
      />
      <Tabs.Screen 
        name="cart" 
        options={{ 
          href: null, // Ẩn khỏi tab bar
          headerShown: false 
        }} 
      />
      <Tabs.Screen 
        name="product-detail" 
        options={{ 
          href: null, // Ẩn khỏi tab bar
          headerShown: false 
        }} 
      />
      <Tabs.Screen 
        name="checkout" 
        options={{ 
          href: null, // Ẩn khỏi tab bar
          headerShown: false 
        }} 
      />
    </Tabs>
  );
}


