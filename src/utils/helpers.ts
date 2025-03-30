export const capitalizeFirstLetter = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  
  export const formatTemperature = (temp: number) => {
    return `${Math.round(temp)}°C`;
  };