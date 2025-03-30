import Constants from 'expo-constants';

export const fetchWeather = async (city: string): Promise<any> => {
  console.log("Running")
  const apiKey = Constants.expoConfig?.extra?.weatherApiKey;
  console.log("api key ==>>",apiKey)
  const API_URL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=us&key=${apiKey}&contentType=json`;
  
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "City not found");
    }
    return await response.json();
  } catch (error) {
    console.error("Weather API Error:", error);
    throw new Error("City not found. Please check the spelling and try again.");
  }
};