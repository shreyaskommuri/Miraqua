import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
        onClose?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        { opacity: fadeAnim }
      ]}
    >
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIsVisible(false);
          onClose?.();
        });
      }}>
        <Text style={styles.closeButton}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  message: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

// Simple toast provider for React Native
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const ToastViewport: React.FC = () => null;

export const ToastTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Text style={styles.message}>{children}</Text>;
};

export const ToastDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Text style={styles.message}>{children}</Text>;
};

export const ToastClose: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.closeButton}>×</Text>
    </TouchableOpacity>
  );
};

export const ToastAction: React.FC<{ children: React.ReactNode; onPress?: () => void }> = ({ children, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.message}>{children}</Text>
    </TouchableOpacity>
  );
};

export type ToastActionElement = React.ReactElement<typeof ToastAction>;
