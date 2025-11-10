import React, { useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import { Image } from 'expo-image';
import { useDispatch } from 'react-redux';
import { checkAuthStatus } from '../redux/auth';
import { theme } from '../theme/theme';
import type { AppDispatch } from '../redux/types';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Start animations immediately
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade in logo after a short delay
    setTimeout(() => {
      Animated.timing(logoFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 300);

    // Check authentication status and finish
    const init = async () => {
      await dispatch(checkAuthStatus());
      
      // Wait a bit before finishing to show the splash screen
      setTimeout(() => {
        onFinish();
      }, 2500);
    };

    init();
  }, [dispatch, fadeAnim, scaleAnim, logoFadeAnim, onFinish]);

  return (
    <View style={styles.container}>
      {/* Background Image - Mother/Child theme */}
      <Image
        source={require('../../assets/background/2149836836.jpg')}
        style={styles.backgroundImage}
        contentFit="cover"
        priority="high"
      />
      
      {/* Gradient Overlay */}
      <View style={styles.overlay} />
      
      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: logoFadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.tagline}>Saving for your child's future</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: 'rgba(107, 20, 109, 0.6)', // Brand color overlay
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  tagline: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
