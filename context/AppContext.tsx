import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, FuelEntry, Reminder, UserStats } from '../types';

interface AppContextType {
  // State
  trips: Trip[];
  fuelEntries: FuelEntry[];
  reminders: Reminder[];
  userStats: UserStats;
  activeTrip: Trip | null;
  
  // Trip functions
  startTrip: () => Promise<void>;
  stopTrip: () => Promise<void>;
  addManualTrip: (distance: number) => Promise<void>;
  
  // Fuel entry functions
  addFuelEntry: (fuelQuantity: number, distance: number) => Promise<void>;
  
  // Reminder functions
  addReminder: (reminder: Omit<Reminder, 'id'>) => Promise<void>;
  updateReminder: (reminder: Reminder) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
}

const defaultStats: UserStats = {
  totalDistance: 0,
  todayDistance: 0,
  lastMileage: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(defaultStats);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  // Load data from AsyncStorage on app start
  useEffect(() => {
    const loadData = async () => {
      try {
        const tripsData = await AsyncStorage.getItem('trips');
        const fuelData = await AsyncStorage.getItem('fuelEntries');
        const remindersData = await AsyncStorage.getItem('reminders');
        const statsData = await AsyncStorage.getItem('userStats');
        const activeTripData = await AsyncStorage.getItem('activeTrip');

        if (tripsData) setTrips(JSON.parse(tripsData));
        if (fuelData) setFuelEntries(JSON.parse(fuelData));
        if (remindersData) setReminders(JSON.parse(remindersData));
        if (statsData) setUserStats(JSON.parse(statsData));
        if (activeTripData) setActiveTrip(JSON.parse(activeTripData));
        
        // Calculate today's distance
        calculateTodayDistance();
      } catch (error) {
        console.error('Error loading data from storage:', error);
      }
    };

    loadData();
  }, []);

  // Calculate today's distance
  const calculateTodayDistance = () => {
    const today = new Date().toISOString().split('T')[0];
    
    const todayTrips = trips.filter(trip => {
      const tripDate = new Date(trip.startTime).toISOString().split('T')[0];
      return tripDate === today;
    });
    
    const distance = todayTrips.reduce((total, trip) => total + trip.distance, 0);
    
    setUserStats(prev => ({
      ...prev,
      todayDistance: distance
    }));
  };

  // Save data to AsyncStorage whenever state changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('trips', JSON.stringify(trips));
        await AsyncStorage.setItem('fuelEntries', JSON.stringify(fuelEntries));
        await AsyncStorage.setItem('reminders', JSON.stringify(reminders));
        await AsyncStorage.setItem('userStats', JSON.stringify(userStats));
        if (activeTrip) {
          await AsyncStorage.setItem('activeTrip', JSON.stringify(activeTrip));
        } else {
          await AsyncStorage.removeItem('activeTrip');
        }
      } catch (error) {
        console.error('Error saving data to storage:', error);
      }
    };

    saveData();
  }, [trips, fuelEntries, reminders, userStats, activeTrip]);

  // Trip functions
  const startTrip = async () => {
    if (activeTrip) return; // Don't start if there's already an active trip
    
    const newTrip: Trip = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      distance: 0,
      duration: 0,
      isActive: true,
    };
    
    setActiveTrip(newTrip);
  };

  const stopTrip = async () => {
    if (!activeTrip) return;
    
    const endTime = new Date().toISOString();
    const updatedTrip: Trip = {
      ...activeTrip,
      endTime,
      isActive: false,
    };
    
    // Update total distance
    setUserStats(prev => ({
      ...prev,
      totalDistance: prev.totalDistance + updatedTrip.distance,
      todayDistance: prev.todayDistance + updatedTrip.distance,
    }));
    
    // Add to trips list
    setTrips(prev => [...prev, updatedTrip]);
    setActiveTrip(null);
  };

  const addManualTrip = async (distance: number) => {
    const now = new Date().toISOString();
    
    const newTrip: Trip = {
      id: Date.now().toString(),
      startTime: now,
      endTime: now,
      distance,
      duration: 0, // Manual entry doesn't track duration
      isActive: false,
    };
    
    // Update total distance
    setUserStats(prev => ({
      ...prev,
      totalDistance: prev.totalDistance + distance,
      todayDistance: prev.todayDistance + distance,
    }));
    
    // Add to trips list
    setTrips(prev => [...prev, newTrip]);
  };

  // Fuel entry functions
  const addFuelEntry = async (fuelQuantity: number, distance: number) => {
    const mileage = distance / fuelQuantity; // km/l
    
    const newEntry: FuelEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      fuelQuantity,
      distance,
      mileage,
    };
    
    // Update last mileage in stats
    setUserStats(prev => ({
      ...prev,
      lastMileage: mileage,
    }));
    
    // Add to fuel entries list
    setFuelEntries(prev => [...prev, newEntry]);
  };

  // Reminder functions
  const addReminder = async (reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
    };
    
    setReminders(prev => [...prev, newReminder]);
  };

  const updateReminder = async (reminder: Reminder) => {
    setReminders(prev => 
      prev.map(item => item.id === reminder.id ? reminder : item)
    );
  };

  const deleteReminder = async (id: string) => {
    setReminders(prev => prev.filter(item => item.id !== id));
  };

  const toggleReminder = async (id: string) => {
    setReminders(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        trips,
        fuelEntries,
        reminders,
        userStats,
        activeTrip,
        startTrip,
        stopTrip,
        addManualTrip,
        addFuelEntry,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleReminder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
