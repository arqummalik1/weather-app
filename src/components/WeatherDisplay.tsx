import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type WeatherDisplayProps = {
  weatherData: {
    currentConditions: {
      temp: number;
      conditions: string;
      humidity: number;
      windspeed: number;
      pressure: number;
      visibility: number;
    };
    days: Array<{
      datetime: string;
      conditions: string;
      tempmax: number;
      tempmin: number;
    }>;
    resolvedAddress?: string;
  } | null;
  cityName: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  error?: string | null;
};

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ 
  weatherData, 
  cityName,
  onRefresh,
  refreshing = false,
  loading = false,
  error = null
}) => {
  const { isDarkMode } = useTheme();

  const getWeatherIcon = (conditions: string): string => {
    const condition = conditions.toLowerCase();
    if (condition.includes('rain')) return 'weather-rainy';
    if (condition.includes('cloud')) return 'weather-cloudy';
    if (condition.includes('sun') || condition.includes('clear')) return 'weather-sunny';
    if (condition.includes('snow')) return 'weather-snowy';
    if (condition.includes('thunder') || condition.includes('storm')) return 'weather-lightning';
    return 'weather-partly-cloudy';
  };

  if (loading && !weatherData) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.darkLoadingContainer]}>
        <ActivityIndicator size="large" color={isDarkMode ? 'white' : '#666'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, isDarkMode && styles.darkErrorContainer]}>
        <MaterialCommunityIcons 
          name="alert-circle" 
          size={40} 
          color={isDarkMode ? '#ff9999' : 'red'} 
        />
        <Text style={[styles.errorText, isDarkMode && styles.darkErrorText]}>
          {error}
        </Text>
      </View>
    );
  }

  if (!weatherData) {
    return (
      <View style={[styles.noDataContainer, isDarkMode && styles.darkNoDataContainer]}>
        <MaterialCommunityIcons 
          name="weather-cloudy" 
          size={60} 
          color={isDarkMode ? '#666' : '#999'} 
        />
        <Text style={[styles.noDataText, isDarkMode && styles.darkNoDataText]}>
          No weather data available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[isDarkMode ? 'white' : 'black']}
            tintColor={isDarkMode ? 'white' : 'black'}
          />
        ) : undefined
      }
    >
      <View style={[
        styles.headerCard,
        isDarkMode && styles.darkHeaderCard
      ]}>
        <Text style={styles.cityName}>{cityName}</Text>
        <View style={styles.currentWeather}>
          <MaterialCommunityIcons 
            name={getWeatherIcon(weatherData.currentConditions.conditions)} 
            size={60} 
            color="white" 
          />
          <Text style={styles.temp}>{Math.round(weatherData.currentConditions.temp)}°F</Text>
        </View>
        <Text style={styles.desc}>{weatherData.currentConditions.conditions}</Text>
      </View>

      <View style={styles.cardsContainer}>
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <MaterialCommunityIcons name="water-percent" size={30} color="#4fc3f7" />
          <Text style={styles.cardTitle}>Humidity</Text>
          <Text style={styles.cardValue}>{weatherData.currentConditions.humidity}%</Text>
        </View>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <MaterialCommunityIcons name="weather-windy" size={30} color="#4fc3f7" />
          <Text style={styles.cardTitle}>Wind</Text>
          <Text style={styles.cardValue}>{weatherData.currentConditions.windspeed} km/h</Text>
        </View>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <MaterialCommunityIcons name="gauge" size={30} color="#4fc3f7" />
          <Text style={styles.cardTitle}>Pressure</Text>
          <Text style={styles.cardValue}>{weatherData.currentConditions.pressure} hPa</Text>
        </View>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <MaterialCommunityIcons name="eye-outline" size={30} color="#4fc3f7" />
          <Text style={styles.cardTitle}>Visibility</Text>
          <Text style={styles.cardValue}>{weatherData.currentConditions.visibility} km</Text>
        </View>
      </View>

      <View style={[styles.dailyForecast, isDarkMode && styles.darkDailyForecast]}>
        <Text style={styles.sectionTitle}>Daily Forecast</Text>
        {weatherData.days.slice(0, 5).map((day, index) => (
          <View key={index} style={styles.forecastCard}>
            <Text style={styles.forecastDay}>
              {new Date(day.datetime).toLocaleDateString('en-US', { weekday: 'short' })}
            </Text>
            <MaterialCommunityIcons 
              name={getWeatherIcon(day.conditions)} 
              size={24} 
              color="white" 
            />
            <Text style={styles.forecastTemp}>
              {Math.round(day.tempmax)}° / {Math.round(day.tempmin)}°
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  darkLoadingContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 10,
    margin: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  darkErrorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderColor: 'rgba(255, 0, 0, 0.4)',
  },
  errorText: {
    marginTop: 10,
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  darkErrorText: {
    color: '#ff9999',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  darkNoDataContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  darkNoDataText: {
    color: '#999',
  },
  headerCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  darkHeaderCard: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderColor: 'rgba(0,0,0,0.5)',
  },
  cityName: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  currentWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  temp: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  desc: {
    fontSize: 20,
    color: 'white',
    textTransform: 'capitalize',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  darkCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderColor: 'rgba(0,0,0,0.4)',
  },
  cardTitle: {
    color: '#e0e0e0',
    fontSize: 16,
    marginVertical: 5,
  },
  cardValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dailyForecast: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  darkDailyForecast: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderColor: 'rgba(0,0,0,0.5)',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  forecastCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  forecastDay: {
    color: 'white',
    fontSize: 16,
    width: 60,
  },
  forecastTemp: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WeatherDisplay;