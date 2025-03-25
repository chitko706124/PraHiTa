import { useState } from "react";
import { useWeather } from "@/hooks/useWeather";
import { LOCATION_KEYS, WeatherLocation } from "@/services/weatherApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import WeatherCard from "@/components/WeatherCard";
import WeatherAlert from "@/components/WeatherAlert";
import WeatherSafetyTips from "../components/ui/WeatherSafetyTips";

const Weather = () => {
  const {
    selectedLocation,
    forecasts,
    severeWeatherAlerts,
    isLoading,
    error,
    changeLocation,
  } = useWeather();

  const handleLocationChange = (value: string) => {
    changeLocation(value as WeatherLocation);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Weather Forecast</h1>
        <p className="text-muted-foreground mt-1">
          5-day weather forecast for cities in Myanmar
        </p>
      </header>

      <div className="mb-6">
        <label
          htmlFor="location-select"
          className="block text-sm font-medium mb-2"
        >
          Select City
        </label>
        <Select value={selectedLocation} onValueChange={handleLocationChange}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Select a city" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(LOCATION_KEYS).map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <WeatherSafetyTips />
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load weather data. Please try again later.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {severeWeatherAlerts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Severe Weather Alerts
              </h2>
              {severeWeatherAlerts.map((forecast, index) => (
                <WeatherAlert key={index} forecast={forecast} />
              ))}
            </div>
          )}

          <h2 className="text-xl font-bold mb-4">
            5-Day Forecast for {selectedLocation}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forecasts?.map((forecast, index) => (
              <WeatherCard key={index} forecast={forecast} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Weather;
