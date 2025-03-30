import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWeather } from '../api/WeatherService';

type WeatherData = {
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
};

export const UseWeather = (city: string, isConnected: boolean | null) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized caching functions
  const cacheWeatherData = useCallback(async (data: WeatherData): Promise<void> => {
    try {
      await AsyncStorage.setItem('lastWeatherData', JSON.stringify(data));
    } catch (err) {
      console.error("Failed to cache weather data", err);
    }
  }, []);

  const getCachedWeather = useCallback(async (): Promise<WeatherData | null> => {
    try {
      const cachedData = await AsyncStorage.getItem('lastWeatherData');
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (err) {
      console.error("Failed to load cached weather", err);
      return null;
    }
  }, []);

  const addToHistory = useCallback(async (data: WeatherData): Promise<void> => {
    try {
      const historyItem = {
        ...data,
        timestamp: new Date().toISOString()
      };
      
      const currentHistory = await AsyncStorage.getItem('weatherHistory');
      let newHistory = currentHistory ? JSON.parse(currentHistory) : [];
      newHistory = [historyItem, ...newHistory].slice(0, 10);
      
      await AsyncStorage.setItem('weatherHistory', JSON.stringify(newHistory));
    } catch (err) {
      console.error("Failed to add to history", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const getWeather = async () => {
      if (!city || !city.trim()) {
        if (isMounted) {
          setError("Please enter a city name");
          setWeather(null);
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
        setError(null);
      }
      
      try {
        if (isConnected) {
          // Fetch fresh data when online
          const data = await fetchWeather(city);
          if (isMounted) {
            if (data) {
              setWeather(data);
              setError(null);
              await cacheWeatherData(data);
              await addToHistory(data);
            } else {
              setError("No weather data found");
              setWeather(null);
            }
          }
        } else {
          // Fallback to cached data when offline
          const cachedData = await getCachedWeather();
          if (isMounted) {
            if (cachedData) {
              setWeather(cachedData);
              setError(null);
            } else {
              setError("No cached data available");
              setWeather(null);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch weather data");
          setWeather(null); // Explicitly set weather to null when there's an error
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getWeather();

    return () => {
      isMounted = false;
    };
  }, [city, isConnected, cacheWeatherData, getCachedWeather, addToHistory]);

  return { weather, loading, error };
};