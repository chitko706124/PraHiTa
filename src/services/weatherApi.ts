
const API_KEY = 'fS9qJDMb7GdxAaE8yaZc7EUz0bNVM9sC';
const BASE_URL = 'https://dataservice.accuweather.com';

// Myanmar city location keys
export const LOCATION_KEYS = {
  'Yangon': '246562',
  'Mandalay': '242614',
  'Naypyitaw': '241431',
  'Bago': '241426',
  'Mawlamyine': '241427',
  'Pathein': '241430',
  'Sittwe': '241456',
  'Taunggyi': '241428',
  'Myitkyina': '358889',
  'Dawei': '241432',
};

export type WeatherLocation = keyof typeof LOCATION_KEYS;

export interface WeatherDay {
  Icon?: number;
  IconPhrase?: string;
  HasPrecipitation?: boolean;
  PrecipitationType?: string;
  PrecipitationIntensity?: string;
}

export interface TemperatureValue {
  Value?: number;
  Unit?: string;
  UnitType?: number;
}

export interface Temperature {
  Minimum?: TemperatureValue;
  Maximum?: TemperatureValue;
}

export interface WeatherForecast {
  Date?: string;
  EpochDate?: number;
  Temperature?: Temperature;
  Day?: WeatherDay;
  Night?: WeatherDay;
  MobileLink?: string;
  Link?: string;
}

export interface WeatherResponse {
  Headline?: {
    EffectiveDate?: string;
    EffectiveEpochDate?: number;
    Severity?: number;
    Text?: string;
    Category?: string;
    EndDate?: string;
    EndEpochDate?: number;
    MobileLink?: string;
    Link?: string;
  };
  DailyForecasts?: WeatherForecast[];
}

export const getLocationForecast = async (location: WeatherLocation): Promise<WeatherForecast[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/forecasts/v1/daily/5day/${LOCATION_KEYS[location]}?apikey=${API_KEY}&details=true&metric=true`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data: WeatherResponse = await response.json();
    console.log('Weather API response:', data);
    return data.DailyForecasts || [];
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};

// Function to determine if weather is severe
export const isSevereWeather = (forecast: WeatherForecast): boolean => {
  // Check if the forecast object and its day property exist
  if (!forecast || !forecast.Day) {
    return false;
  }
  
  const severeKeywords = [
    'storm', 'thunderstorm', 'rain', 'heavy', 'flood', 
    'wind', 'hurricane', 'typhoon', 'cyclone', 'tornado'
  ];
  
  // Make sure we have an IconPhrase and it's not undefined
  const iconPhrase = forecast.Day.IconPhrase?.toLowerCase() || '';
  
  return (
    (forecast.Day.HasPrecipitation === true && 
     forecast.Day.PrecipitationIntensity === 'Heavy') ||
    severeKeywords.some(keyword => iconPhrase.includes(keyword))
  );
};

export const searchLocationByCity = async (city: string): Promise<{ Key: string; LocalizedName: string }[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/locations/v1/cities/search?apikey=${API_KEY}&q=${encodeURIComponent(city)}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();
    console.log('Location search response:', data);
    return data || [];
  } catch (error) {
    console.error('Error searching location:', error);
    throw error;
  }
};
