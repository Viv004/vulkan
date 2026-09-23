import { createStackNavigator } from '@react-navigation/stack';
import { setStatusBarHidden, StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native-web';
import LandingPage from './Screens/LandingPage';
import Dashboard from './Screens/Dashboard';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ App crashed:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Unknown error occurred'}
          </Text>
          <Text style={styles.errorHint}>
            Please refresh the page or check your internet connection
          </Text>
          {Platform.OS === 'web' && (
            <button 
              onClick={() => window.location.reload()} 
              style={{
                marginTop: 20,
                padding: '12px 24px',
                backgroundColor: '#00C853',
                color: '#000',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const LoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#e5c11f" />
    <Text style={styles.loadingText}>Loading Vulkan...</Text>
  </View>
);

export default function App() {
  const Stack = createStackNavigator();
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
      const initializeApp = async () => {
        try {
          // Android-specific setup
          if (Platform.OS === 'android') {
            setStatusBarHidden(true, 'none');
            await Navigation.setVisibilityAsync("hidden");
          }
  
          // Add small delay to ensure Firebase is initialized
          await new Promise(resolve => setTimeout(resolve, 100));
          
          setIsReady(true);
         // console.log('✅ App initialized successfully');
        } catch (error) {
          console.error('❌ App initialization error:', error);
          // Still set ready to true to show error boundary if needed
          setIsReady(true);
        }
      };
  
      initializeApp();
    }, []);

   if (!isReady) {
    return <LoadingFallback />;
  }
  return (
     <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
            <Stack.Screen name="Home" component={LandingPage} />
            <Stack.Screen name="Dashboard" component={Dashboard} />
        </Stack.Navigator>
        <StatusBar hidden={true} backgroundColor="transparent" />
      </NavigationContainer>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});