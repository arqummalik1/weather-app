import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  TextInput, 
  ActivityIndicator, 
  ImageBackground, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Keyboard 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UseWeather } from '../hooks/UseWeather';
import WeatherDisplay from '../components/WeatherDisplay';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import NetInfo from '@react-native-community/netinfo';

const WeatherScreen = ({ route }) => {
  const navigation = useNavigation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const initialCity = route.params?.city || "New York";
  const [query, setQuery] = useState(initialCity);
  const [city, setCity] = useState(initialCity);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const { weather, loading, error } = UseWeather(city, isConnected);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Check network connection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Simple debounce implementation
  const handleSearchInput = (text: string) => {
    setQuery(text);
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer
    debounceTimer.current = setTimeout(() => {
      if (text.trim() && isConnected) {
        setCity(text);
      }
    }, 500);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    if (!isConnected) return;
    
    // Immediately search when submit is pressed
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    setCity(query);
  };

  const handleRefresh = async () => {
    if (!isConnected) return;
    setRefreshing(true);
    try {
      // Force a new search with current query
      setCity(prev => prev);
    } finally {
      setRefreshing(false);
    }
  };

  const backgroundImage = isDarkMode 
    ? require('../../assets/BGs/background_bg.png') 
    : require('../../assets/BGs/background_bg.png');

  return (
    <ImageBackground 
      source={backgroundImage} 
      style={styles.background}
    >
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.header}>
          <Text style={[styles.headerText, isDarkMode && styles.darkHeaderText]}>Weather</Text>
          <TouchableOpacity 
            style={styles.themeToggle}
            onPress={toggleDarkMode}
          >
            <MaterialCommunityIcons 
              name={isDarkMode ? 'weather-sunny' : 'weather-night'} 
              size={24} 
              color={isDarkMode ? 'white' : '#666'} 
            />
          </TouchableOpacity>
        </View>

        {!isConnected && (
          <View style={[styles.offlineContainer, isDarkMode && styles.darkOfflineContainer]}>
            <MaterialCommunityIcons 
              name="wifi-off" 
              size={24} 
              color={isDarkMode ? '#ff9999' : 'red'} 
              style={styles.offlineIcon}
            />
            <Text style={[styles.offlineText, isDarkMode && styles.darkOfflineText]}>
              You're offline. Showing cached data.
            </Text>
          </View>
        )}
        
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchBox,
              isDarkMode && styles.darkSearchBox,
              !isConnected && styles.offlineSearchBox
            ]}
            placeholder="Enter city"
            placeholderTextColor={isDarkMode ? '#ccc' : '#999'}
            value={query}
            onChangeText={handleSearchInput}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            editable={isConnected}
          />
          <TouchableOpacity 
            style={styles.historyIcon} 
            onPress={() => navigation.navigate('History')}
          >
            <MaterialCommunityIcons 
              name="history" 
              size={24} 
              color={isDarkMode ?  '#fff' : '#777'} 
            />
          </TouchableOpacity>
        </View>
        
        {error && (
          <View style={[styles.errorContainer, isDarkMode && styles.darkErrorContainer]}>
            <MaterialCommunityIcons 
              name="alert-circle" 
              size={24} 
              color={isDarkMode ? '#ff9999' : 'red'} 
              style={styles.errorIcon}
            />
            <Text style={[styles.errorText, isDarkMode && styles.darkErrorText]}>
              {error}
            </Text>
          </View>
        )}
        
        {loading ? (
          <ActivityIndicator size="large" color={isDarkMode ? 'white' : '#666'} />
        ) : weather ? (
          <WeatherDisplay 
            weatherData={weather} 
            cityName={city} 
            onRefresh={isConnected ? handleRefresh : undefined}
            refreshing={refreshing}
            isConnected={isConnected}
          />
        ) : null}
      </View>
    </ImageBackground>
  );
};
const styles = StyleSheet.create({
  background: { 
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingTop: 70,
  },
  darkContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  darkHeaderText: {
    color: '#f0f0f0',
  },
  themeToggle: {
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBox: { 
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 15,
    fontSize: 16,
    color: '#333',
    flex: 1,
    paddingRight: 50,
  },
  darkSearchBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
  },
  historyIcon: {
    position: 'absolute',
    right: 15,
    padding: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  darkErrorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderColor: 'rgba(255, 0, 0, 0.4)',
  },
  errorIcon: {
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    color: 'red',
    fontSize: 16,
  },
  darkErrorText: {
    color: '#ff9999',
  },
  offlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.3)',
  },
  darkOfflineContainer: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    borderColor: 'rgba(255, 165, 0, 0.4)',
  },
  offlineIcon: {
    marginRight: 10,
  },
  offlineText: {
    flex: 1,
    color: 'orange',
    fontSize: 14,
  },
  darkOfflineText: {
    color: '#ffcc80',
  },
  offlineSearchBox: {
    opacity: 0.7,
  },
});

export default WeatherScreen;