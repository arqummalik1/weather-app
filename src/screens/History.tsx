import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherData } from '../hooks/UseWeather';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HistoryScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const [history, setHistory] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem('weatherHistory');
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const renderItem = ({ item }: { item: WeatherData }) => (
    <TouchableOpacity 
      style={[styles.card, isDarkMode && styles.darkCard]}
      onPress={() => navigation.navigate('Weather', { city: item.resolvedAddress })}
    >
      <Text style={styles.city}>{item.resolvedAddress}</Text>
      <Text style={styles.temp}>{Math.round(item.currentConditions.temp)}°F</Text>
      <Text style={styles.conditions}>{item.currentConditions.conditions}</Text>
      <Text style={styles.date}>
        {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown date'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground 
      source={isDarkMode 
        ? require('../../assets/BGs/background_bg.png') 
        : require('../../assets/BGs/background_bg.png')
      } 
      style={styles.background}
    >
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons 
              name="arrow-left" 
              size={24} 
              color={isDarkMode ? 'white' : '#666'} 
            />
          </TouchableOpacity>
          <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Search History</Text>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color={isDarkMode ? 'white' : '#666'} />
        ) : (
          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={
              <Text style={[styles.empty, isDarkMode && styles.darkEmpty]}>No search history yet</Text>
            }
            contentContainerStyle={styles.listContainer}
          />
        )}
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
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  darkTitle: {
    color: '#f0f0f0',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  darkCard: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderColor: 'rgba(0,0,0,0.5)',
  },
  city: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },
  temp: {
    fontSize: 26,
    color: 'white',
    fontWeight: '800',
  },
  conditions: {
    fontStyle: 'italic',
    marginVertical: 5,
    color: '#e0e0e0',
  },
  date: {
    fontSize: 12,
    color: '#e0e0e0',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'white',
  },
  darkEmpty: {
    color: '#f0f0f0',
  },
});

export default HistoryScreen;