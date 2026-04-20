import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, Image, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, Animated, TextInput, Share, Dimensions
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

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
};

const API_URL = 'http://192.168.0.104/leohub_api';

export default function PostDetails({ route, navigation }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchPostDetails();
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  };

  const animateHeart = () => {
    Animated.sequence([
      Animated.timing(heartAnim, { toValue: 1.5, duration: 200, useNativeDriver: true }),
      Animated.timing(heartAnim, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();
  };

  const fetchPostDetails = async () => {
    try {
      console.log('Fetching post ID:', postId);
      const response = await fetch(`${API_URL}/get_post_details_new.php?id=${postId}`);
      const text = await response.text();
      console.log('Raw response:', text);

      const data = JSON.parse(text);
      if (data.success) {
        setPost(data.post);
        setComments(data.comments);
      } else {
        Alert.alert('Error', data.error || 'Failed to load post');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    animateHeart();
    setIsLiked(!isLiked);
    try {
      await fetch(`${API_URL}/like_post_new.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId })
      });
      fetchPostDetails();
    } catch (error) {
      console.error(error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this post: ${post?.title}\n\n${post?.body}\n\nShared from SocialSphere App`,
        title: post?.title,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/add_comment_new.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          user_id: 'guest_user',
          username: 'You',
          comment: newComment
        })
      });
      const data = await response.json();
      if (data.success) {
        setNewComment('');
        fetchPostDetails();
        Alert.alert('Success', 'Comment added!');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Details</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Feather name="share-2" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Author Info */}
          <View style={styles.authorSection}>
            <Image source={{ uri: post?.user_avatar }} style={styles.authorAvatar} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>@{post?.username}</Text>
              <Text style={styles.postDate}>{formatDate(post?.created_at)}</Text>
            </View>
            <TouchableOpacity style={styles.followBtn}>
              <Text style={styles.followBtnText}>Follow</Text>
            </TouchableOpacity>
          </View>

          {/* Post Content */}
          <View style={styles.contentSection}>
            <Text style={styles.postTitle}>{post?.title}</Text>
            <Text style={styles.postBody}>{post?.body}</Text>

            {post?.image_url && (
              <Image source={{ uri: post.image_url }} style={styles.fullImage} />
            )}

            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{post?.category}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={20} color={COLORS.secondary} />
              <Text style={styles.statText}>{post?.likes} likes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={18} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{post?.comments} comments</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="repeat" size={18} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{post?.shares} shares</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={28} color={isLiked ? COLORS.secondary : COLORS.white} />
              </Animated.View>
              <Text style={styles.actionButtonText}>Like</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Comment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>

            {/* Comment Input */}
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor={COLORS.textSecondary}
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity style={styles.postCommentBtn} onPress={handleAddComment}>
                <Ionicons name="send" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            {comments.length === 0 ? (
              <View style={styles.noComments}>
                <Text style={styles.noCommentsEmoji}>💬</Text>
                <Text style={styles.noCommentsText}>No comments yet</Text>
                <Text style={styles.noCommentsSub}>Be the first to comment!</Text>
              </View>
            ) : (
              comments.map((comment, index) => (
                <Animated.View
                  key={comment.id}
                  style={[styles.commentItem, { animationDelay: `${index * 100}ms` }]}
                >
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {comment.username?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUsername}>@{comment.username}</Text>
                    <Text style={styles.commentText}>{comment.comment}</Text>
                    <Text style={styles.commentTime}>{formatTimeAgo(comment.created_at)}</Text>
                  </View>
                </Animated.View>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { color: COLORS.textSecondary, marginTop: 10 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: COLORS.primary },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  shareBtn: { padding: 5 },

  authorSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 20, marginBottom: 16 },
  authorAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12, borderWidth: 2, borderColor: COLORS.primary },
  authorInfo: { flex: 1 },
  authorName: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  postDate: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  followBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  followBtnText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },

  contentSection: { backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 20, padding: 20, marginBottom: 16 },
  postTitle: { color: COLORS.white, fontSize: 24, fontWeight: 'bold', marginBottom: 12, lineHeight: 32 },
  postBody: { color: COLORS.text, fontSize: 16, lineHeight: 24, marginBottom: 16 },
  fullImage: { width: '100%', height: 250, borderRadius: 15, marginBottom: 16, borderWidth: 2, borderColor: COLORS.primary },
  categoryTag: { alignSelf: 'flex-start', backgroundColor: COLORS.primary + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  categoryTagText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold' },

  statsSection: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 20, padding: 15, marginBottom: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  statText: { color: COLORS.textSecondary, fontSize: 13 },

  actionSection: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 20, padding: 15, marginBottom: 16 },
  actionButton: { alignItems: 'center', gap: 6 },
  actionButtonText: { color: COLORS.white, fontSize: 12, marginTop: 4 },

  commentsSection: { backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 20, padding: 20, marginBottom: 30 },
  commentsTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  commentInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 25, paddingHorizontal: 15, paddingVertical: 8, marginBottom: 20 },
  commentInput: { flex: 1, color: COLORS.white, fontSize: 14, maxHeight: 80 },
  postCommentBtn: { padding: 5 },

  commentItem: { flexDirection: 'row', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  commentAvatarText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  commentContent: { flex: 1 },
  commentUsername: { color: COLORS.white, fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  commentText: { color: COLORS.text, fontSize: 14, marginBottom: 4, lineHeight: 20 },
  commentTime: { color: COLORS.textSecondary, fontSize: 10 },

  noComments: { alignItems: 'center', paddingVertical: 40 },
  noCommentsEmoji: { fontSize: 48, marginBottom: 12 },
  noCommentsText: { color: COLORS.textSecondary, fontSize: 16 },
  noCommentsSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 5 },
});