import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, FlatList, Image,
  ActivityIndicator, StatusBar, Dimensions, TouchableOpacity,
  Alert, Animated, RefreshControl, TextInput, Modal, ScrollView
} from 'react-native';
import { Ionicons, Feather, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#6366F1',
  secondary: '#FF6584',
  background: '#0A0E27',
  surface: '#1E293B',
  card: '#2D3748',
  white: '#FFFFFF',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
  success: '#10B981',
  trending: '#F59E0B',
};

const API_URL = 'http://192.168.0.104/leohub_api';

export default function Task2Feed({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  const categories = ['All', 'Technology', 'Development', 'Design', 'Community', 'Lifestyle'];

  useEffect(() => {
    fetchPosts();
    startAnimations();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [activeCategory, searchQuery]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(headerAnim, { toValue: 1, friction: 8, useNativeDriver: true })
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(fabAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(fabAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  };

  const animateHeart = () => {
    Animated.sequence([
      Animated.timing(heartAnim, { toValue: 1.5, duration: 200, useNativeDriver: true }),
      Animated.timing(heartAnim, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();
  };

  const fetchPosts = async () => {
    try {
      let url = `${API_URL}/get_social_posts_new.php`;
      if (activeCategory !== 'All') {
        url += `?category=${activeCategory}`;
      }
      if (searchQuery) {
        url += `${activeCategory !== 'All' ? '&' : '?'}search=${searchQuery}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.success && data.data) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleLike = async (postId) => {
    animateHeart();
    try {
      await fetch(`${API_URL}/like_post_new.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId })
      });
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Technology': '#6366F1',
      'Development': '#43E97B',
      'Design': '#FF6584',
      'Community': '#F59E0B',
      'Lifestyle': '#20B2AA',
    };
    return colors[category] || '#6366F1';
  };

  const PostCard = ({ item, index }) => {
    const cardScale = useRef(new Animated.Value(0.9)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, friction: 8, useNativeDriver: true, delay: index * 100 }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 500, useNativeDriver: true, delay: index * 100 })
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.postCard,
          {
            opacity: cardOpacity,
            transform: [{ scale: cardScale }]
          }
        ]}
      >
        <LinearGradient
          colors={[COLORS.card, COLORS.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Header */}
          <View style={styles.postHeader}>
            <Image source={{ uri: item.user_avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.username}>@{item.username}</Text>
              <View style={styles.timeContainer}>
                <Feather name="clock" size={10} color={COLORS.textSecondary} />
                <Text style={styles.postTime}>{formatTimeAgo(item.created_at)}</Text>
              </View>
            </View>
            {item.is_trending == 1 && (
              <View style={styles.trendingBadge}>
                <Text style={styles.trendingText}>🔥 Trending</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
          >
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postBody} numberOfLines={3}>{item.body}</Text>

            {item.image_url && (
              <TouchableOpacity onPress={() => { setSelectedImage(item.image_url); setShowImageModal(true); }}>
                <Image source={{ uri: item.image_url }} style={styles.postImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.imageOverlay}
                >
                  <Text style={styles.viewImageText}>🔍 Tap to view</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
              <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
                {item.category}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Actions */}
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id)}>
              <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
                <Ionicons name="heart-outline" size={22} color={COLORS.secondary} />
              </Animated.View>
              <Text style={styles.actionText}>{item.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
            >
              <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.actionText}>{item.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="repeat-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.actionText}>{item.shares}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="bookmark-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const ImageModal = () => (
    <Modal visible={showImageModal} transparent={true} animationType="fade">
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalClose} onPress={() => setShowImageModal(false)}>
          <AntDesign name="closecircle" size={40} color={COLORS.white} />
        </TouchableOpacity>
        <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <LinearGradient colors={[COLORS.background, '#1a1f3a']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading amazing content...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { transform: [{ scale: headerAnim }] }]}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>SocialSphere</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
              <Ionicons name="search-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Search Bar */}
      {showSearch && (
        <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Categories */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, activeCategory === cat && styles.activeCategoryChip]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryChipText, activeCategory === cat && styles.activeCategoryChipText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Posts Feed */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => <PostCard item={item} index={index} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📱</Text>
              <Text style={styles.emptyText}>No posts found</Text>
              <Text style={styles.emptySubText}>Try a different category or search term</Text>
              <TouchableOpacity onPress={fetchPosts} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>⟳ Refresh</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={styles.feedList}
        />
      </Animated.View>

      {/* Floating Action Button */}
      <Animated.View style={[styles.fab, {
        transform: [{
          translateY: fabAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -10]
          })
        }]
      }]}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.fabGradient}
        >
          <TouchableOpacity onPress={() => Alert.alert('Create Post', 'Post creation coming soon!')}>
            <Feather name="plus" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      <ImageModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.textSecondary, marginTop: 15, fontSize: 16 },

  header: { marginBottom: 15, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
  headerGradient: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.white, letterSpacing: 1 },
  headerIcons: { flexDirection: 'row', gap: 20 },
  notificationBadge: { position: 'absolute', top: -5, right: -8, backgroundColor: COLORS.secondary, borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  notificationBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: 20, marginBottom: 15, paddingHorizontal: 18, borderRadius: 25, height: 50, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, marginLeft: 12, color: COLORS.white, fontSize: 15 },

  categoriesScroll: { paddingHorizontal: 20, marginBottom: 15 },
  categoryChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 25, backgroundColor: COLORS.surface, marginRight: 12, borderWidth: 1, borderColor: COLORS.border },
  activeCategoryChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { color: COLORS.textSecondary, fontSize: 13 },
  activeCategoryChipText: { color: COLORS.white, fontWeight: 'bold' },

  feedList: { paddingHorizontal: 16, paddingBottom: 80 },
  postCard: { marginBottom: 20, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  cardGradient: { padding: 16 },

  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12, borderWidth: 2, borderColor: COLORS.primary },
  userInfo: { flex: 1 },
  username: { color: COLORS.white, fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  timeContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postTime: { color: COLORS.textSecondary, fontSize: 11 },
  trendingBadge: { backgroundColor: COLORS.trending, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  trendingText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },

  postTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold', marginBottom: 10, lineHeight: 24 },
  postBody: { color: COLORS.text, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  postImage: { width: '100%', height: 220, borderRadius: 15, marginBottom: 12 },
  imageOverlay: { position: 'absolute', bottom: 12, left: 0, right: 0, height: 40, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, justifyContent: 'center', alignItems: 'center' },
  viewImageText: { color: COLORS.white, fontSize: 12, fontWeight: '500' },

  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 15, marginBottom: 12 },
  categoryText: { fontSize: 11, fontWeight: 'bold' },

  postActions: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, marginTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20 },
  actionText: { color: COLORS.textSecondary, fontSize: 13 },

  emptyContainer: { alignItems: 'center', paddingTop: 100 },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyText: { color: COLORS.white, fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptySubText: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 20 },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
  retryBtnText: { color: COLORS.white, fontWeight: 'bold' },

  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },

  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  modalImage: { width: width, height: height * 0.8 },
});