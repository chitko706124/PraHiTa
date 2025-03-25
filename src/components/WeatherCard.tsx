
import { WeatherForecast } from '@/services/weatherApi';
import { format, parseISO } from 'date-fns';
import { Cloud, CloudRain, Sun, CloudDrizzle, CloudFog, CloudLightning, CloudSnow } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeatherCardProps {
  forecast: WeatherForecast;
}

const WeatherCard = ({ forecast }: WeatherCardProps) => {
  // Parse the date safely - handle ISO format date strings
  const parseDate = () => {
    try {
      if (!forecast.Date) return new Date();
      
      // Make sure we have a proper date string
      const dateStr = String(forecast.Date);
      return parseISO(dateStr);
    } catch (error) {
      console.error('Error parsing date:', error, forecast.Date);
      return new Date(); // Fallback to current date
    }
  };
  
  const date = parseDate();
  const formattedDate = format(date, 'EEEE, MMMM d');
  
  // Function to determine which weather icon to display
  const getWeatherIcon = () => {
    // Check if forecast.Day exists before accessing IconPhrase
    if (!forecast.Day?.IconPhrase) {
      return <Cloud className="h-12 w-12 text-gray-400" />;
    }
    
    const iconPhrase = forecast.Day.IconPhrase.toLowerCase();
    
    if (iconPhrase.includes('rain') || iconPhrase.includes('shower')) {
      return <CloudRain className="h-12 w-12 text-blue-600" />;
    } else if (iconPhrase.includes('cloud')) {
      return <Cloud className="h-12 w-12 text-gray-600" />;
    } else if (iconPhrase.includes('fog') || iconPhrase.includes('mist')) {
      return <CloudFog className="h-12 w-12 text-gray-500" />;
    } else if (iconPhrase.includes('thunder') || iconPhrase.includes('storm')) {
      return <CloudLightning className="h-12 w-12 text-yellow-600" />;
    } else if (iconPhrase.includes('snow') || iconPhrase.includes('ice')) {
      return <CloudSnow className="h-12 w-12 text-blue-400" />;
    } else if (iconPhrase.includes('drizzle')) {
      return <CloudDrizzle className="h-12 w-12 text-blue-500" />;
    } else {
      return <Sun className="h-12 w-12 text-yellow-500" />;
    }
  };
  
  // Convert temperature from F to C if needed
  const getTemperature = (temp?: { Value?: number; Unit?: string }) => {
    if (!temp || typeof temp.Value !== 'number') return '?';
    
    // If the temperature is in Fahrenheit, convert to Celsius
    if (temp.Unit === 'F') {
      return Math.round((temp.Value - 32) * 5 / 9);
    }
    
    return Math.round(temp.Value);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{formattedDate}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{forecast.Day?.IconPhrase || 'Weather data unavailable'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {getTemperature(forecast.Temperature?.Minimum)}°C - {getTemperature(forecast.Temperature?.Maximum)}°C
            </p>
            {forecast.Day?.HasPrecipitation && (
              <p className="text-sm mt-1">
                {forecast.Day.PrecipitationIntensity} {forecast.Day.PrecipitationType}
              </p>
            )}
          </div>
          {getWeatherIcon()}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
