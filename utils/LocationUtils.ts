import * as Location from "expo-location";

// Define Address type since it's not exported from expo-location
type Address = {
  city: string | null;
  country: string | null;
  district: string | null;
  isoCountryCode: string | null;
  name: string | null;
  postalCode: string | null;
  region: string | null;
  street: string | null;
  subregion: string | null;
  timezone: string | null;
};

/**
 * Gets the current location coordinates
 * @returns Promise with location object containing coordinates
 */
export const getCurrentLocation = async () => {
  console.log("fetching location");
  // Request permission if not already granted
  const { status } = await Location.requestForegroundPermissionsAsync();
  console.log("permission status", status);
  if (status !== "granted") {
    throw new Error("Location permission not granted");
  }

  // Get current position with high accuracy
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Highest,
  });

  return location;
};

/**
 * Gets the address of the current location
 * @returns Promise with address object
 */
export const getCurrentAddress = async () => {
  try {
    // Get current location coordinates
    const location = await getCurrentLocation();

    // Use reverse geocoding to get address from coordinates
    const addresses = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    // Return the first address result if available
    if (addresses && addresses.length > 0) {
      return {
        success: true,
        address: addresses[0],
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };
    } else {
      return {
        success: false,
        error: "No address found for this location",
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      coordinates: null,
    };
  }
};

/**
 * Gets address from specific coordinates
 * @param latitude - The latitude coordinate
 * @param longitude - The longitude coordinate
 * @returns Promise with address object
 */
export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
) => {
  try {
    // Use reverse geocoding to get address from coordinates
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    // Return the first address result if available
    if (addresses && addresses.length > 0) {
      return {
        success: true,
        address: addresses[0],
      };
    } else {
      return {
        success: false,
        error: "No address found for these coordinates",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Formats an address object into a readable string
 * @param address - The address object from reverseGeocodeAsync
 * @returns Formatted address string
 */
export const formatAddress = (address: Address): string => {
  const components = [
    address.name,
    address.street,
    address.district,
    address.city,
    address.region,
    address.postalCode,
    address.country,
  ];

  // Filter out undefined or empty components and join with commas
  return components.filter((component) => component).join(", ");
};
