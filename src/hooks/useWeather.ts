
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLocationForecast, WeatherLocation, WeatherForecast, isSevereWeather } from '../services/weatherApi';

export const useWeather = (initialLocation: WeatherLocation = 'Yangon') => {
  const [selectedLocation, setSelectedLocation] = useState<WeatherLocation>(initialLocation);

  const {
    data: forecasts,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['weather', selectedLocation],
    queryFn: () => getLocationForecast(selectedLocation),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Filter for severe weather alerts with safety check
  const severeWeatherAlerts = forecasts?.filter(forecast => {
    if (!forecast || !forecast.Day) return false;
    return isSevereWeather(forecast);
  }) || [];
  
  const changeLocation = (location: WeatherLocation) => {
    setSelectedLocation(location);
  };

  return {
    selectedLocation,
    forecasts,
    severeWeatherAlerts,
    isLoading,
    error,
    changeLocation,
    refetch
  };
};
