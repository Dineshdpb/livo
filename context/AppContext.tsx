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
  startTrip: (locationData?: {
    startLocation?: { latitude: number; longitude: number };
    startAddress?: string;
  }) => Promise<void>;
  stopTrip: (locationData?: {
    endLocation?: { latitude: number; longitude: number };
    endAddress?: string;
  }) => Promise<void>;
  updateActiveTrip: (tripUpdate: Partial<Trip>) => Promise<void>;
  addManualTrip: (distance: number) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  
  // Fuel entry functions
  addFuelEntry: (fuelQuantity: number, distance: number) => Promise<void>;
  deleteFuelEntry: (id: string) => Promise<void>;
  
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
        
        // Active trip is now handled separately in startTrip/stopTrip/updateActiveTrip
        // for more immediate synchronization
      } catch (error) {
        console.error('Error saving data to storage:', error);
      }
    };

    saveData();
  }, [trips, fuelEntries, reminders, userStats]);
  
  // Add a function to update the active trip (for location updates)
  const updateActiveTrip = async (tripUpdate: Partial<Trip>) => {
    if (!activeTrip) return;
    
    const updatedTrip = {
      ...activeTrip,
      ...tripUpdate,
    };
    
    setActiveTrip(updatedTrip);
    
    // Immediately sync to AsyncStorage
    try {
      await AsyncStorage.setItem('activeTrip', JSON.stringify(updatedTrip));
    } catch (error) {
      console.error('Error updating active trip in storage:', error);
    }
  };

  // Trip functions
  const startTrip = async (locationData?: {
    startLocation?: { latitude: number; longitude: number };
    startAddress?: string;
  }) => {
    if (activeTrip) return; // Don't start if there's already an active trip
    
    const newTrip: Trip = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      distance: 0,
      duration: 0,
      isActive: true,
      locations: [], // Store location history for the trip
      avgSpeed: 0,
      // Add location data if provided
      startLocation: locationData?.startLocation,
      startAddress: locationData?.startAddress,
    };
    
    setActiveTrip(newTrip);
    
    // Immediately save to AsyncStorage
    try {
      await AsyncStorage.setItem('activeTrip', JSON.stringify(newTrip));
      console.log('Active trip saved to storage');
    } catch (error) {
      console.error('Error saving active trip to storage:', error);
    }
  };

  const stopTrip = async (locationData?: {
    endLocation?: { latitude: number; longitude: number };
    endAddress?: string;
  }) => {
    if (!activeTrip) return;
    
    const endTime = new Date().toISOString();
    const updatedTrip: Trip = {
      ...activeTrip,
      endTime,
      isActive: false,
      // Add end location data if provided
      endLocation: locationData?.endLocation,
      endAddress: locationData?.endAddress,
    };
    
    // Update total distance
    setUserStats(prev => ({
      ...prev,
      totalDistance: prev.totalDistance + updatedTrip.distance,
      todayDistance: prev.todayDistance + updatedTrip.distance,
    }));
    
    // Add to trips list
    setTrips(prev => [...prev, updatedTrip]);
    
    // Clear active trip
    setActiveTrip(null);
    
    // Immediately remove activeTrip from AsyncStorage
    try {
      await AsyncStorage.removeItem('activeTrip');
      console.log('Active trip removed from storage');
      
      // Save the completed trip to history
      const tripsData = await AsyncStorage.getItem('trips');
      const existingTrips = tripsData ? JSON.parse(tripsData) : [];
      const updatedTrips = [...existingTrips, updatedTrip];
      await AsyncStorage.setItem('trips', JSON.stringify(updatedTrips));
      console.log('Trip history updated in storage');
    } catch (error) {
      console.error('Error updating trip data in storage:', error);
    }
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
  
  // Delete a trip
  const deleteTrip = async (id: string) => {
    try {
      // Find the trip to delete
      const tripToDelete = trips.find(trip => trip.id === id);
      if (!tripToDelete) return;
      
      // Update total distance (subtract the deleted trip's distance)
      setUserStats(prev => {
        const updatedTotalDistance = prev.totalDistance - tripToDelete.distance;
        
        // Check if the trip is from today to update today's distance
        const tripDate = new Date(tripToDelete.startTime).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        const updatedTodayDistance = tripDate === today ? 
          prev.todayDistance - tripToDelete.distance : 
          prev.todayDistance;
        
        return {
          ...prev,
          totalDistance: updatedTotalDistance >= 0 ? updatedTotalDistance : 0,
          todayDistance: updatedTodayDistance >= 0 ? updatedTodayDistance : 0,
        };
      });
      
      // Remove from trips list
      const updatedTrips = trips.filter(trip => trip.id !== id);
      setTrips(updatedTrips);
      
      // Update AsyncStorage
      await AsyncStorage.setItem('trips', JSON.stringify(updatedTrips));
      console.log('Trip deleted successfully');
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
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
  
  // Delete a fuel entry
  const deleteFuelEntry = async (id: string) => {
    try {
      // Find the entry to delete
      const entryToDelete = fuelEntries.find(entry => entry.id === id);
      if (!entryToDelete) return;
      
      // Check if this is the last entry and update stats if needed
      const updatedEntries = fuelEntries.filter(entry => entry.id !== id);
      
      // If we deleted the most recent entry, update lastMileage to the previous entry's mileage
      if (updatedEntries.length > 0 && entryToDelete.mileage === userStats.lastMileage) {
        // Sort entries by date (newest first)
        const sortedEntries = [...updatedEntries].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // Update lastMileage to the most recent entry
        if (sortedEntries[0]) {
          setUserStats(prev => ({
            ...prev,
            lastMileage: sortedEntries[0].mileage,
          }));
        }
      } else if (updatedEntries.length === 0) {
        // If no entries left, reset lastMileage to 0
        setUserStats(prev => ({
          ...prev,
          lastMileage: 0,
        }));
      }
      
      // Update state
      setFuelEntries(updatedEntries);
      
      // Update AsyncStorage
      await AsyncStorage.setItem('fuelEntries', JSON.stringify(updatedEntries));
      console.log('Fuel entry deleted successfully');
    } catch (error) {
      console.error('Error deleting fuel entry:', error);
    }
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
        updateActiveTrip,
        addManualTrip,
        deleteTrip,
        addFuelEntry,
        deleteFuelEntry,
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
