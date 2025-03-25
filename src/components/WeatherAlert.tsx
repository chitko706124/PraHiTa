
import { WeatherForecast } from '@/services/weatherApi';
import { format, parseISO } from 'date-fns';
import { CloudRain, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeatherAlertProps {
  forecast: WeatherForecast;
}

const WeatherAlert = ({ forecast }: WeatherAlertProps) => {
  // Parse the date safely
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
  const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
  
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
    <Card className="border-red-400 bg-red-50 dark:bg-red-950/30 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span>Severe Weather Alert - {formattedDate}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{forecast.Day?.IconPhrase || 'Severe weather alert'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Temperature: {getTemperature(forecast.Temperature?.Minimum)}°C - {getTemperature(forecast.Temperature?.Maximum)}°C
            </p>
            {forecast.Day?.HasPrecipitation && (
              <p className="text-sm font-medium text-red-600 mt-1">
                {forecast.Day.PrecipitationIntensity} {forecast.Day.PrecipitationType}
              </p>
            )}
          </div>
          <CloudRain className="h-12 w-12 text-red-600" />
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherAlert;
