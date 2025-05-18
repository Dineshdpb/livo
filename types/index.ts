export interface Trip {
  id: string;
  startTime: string;
  endTime?: string;
  distance: number; // in kilometers
  duration: number; // in seconds
  isActive: boolean;
}

export interface FuelEntry {
  id: string;
  date: string;
  fuelQuantity: number; // in liters
  distance: number; // in kilometers
  mileage: number; // calculated km/l
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  triggerType: 'distance' | 'date' | 'both';
  triggerDistance?: number; // in kilometers
  triggerDate?: string;
  isActive: boolean;
  isCustom: boolean;
}

export interface UserStats {
  totalDistance: number; // in kilometers
  todayDistance: number; // in kilometers
  lastMileage: number; // km/l
}

export type RootStackParamList = {
  Home: undefined;
  Trip: undefined;
  Mileage: undefined;
  Reminders: undefined;
  AddReminder: { reminder?: Reminder };
  Settings: undefined;
};
