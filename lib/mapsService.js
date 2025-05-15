// lib/mapsService.js
import axios from 'axios';

const Maps_API_KEY = process.env.Maps_API_KEY;

/**
 * Calculates the driving distance between two locations using Google Maps Distance Matrix API.
 * @param {string} origin - The starting point (address, place name, or lat/lng).
 * @param {string} destination - The ending point (address, place name, or lat/lng).
 * @returns {Promise<number | null>} The distance in kilometers, or null if an error occurs or distance not found.
 */
export async function calculateDistanceBetweenLocations(origin, destination) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [calculateDistanceBetweenLocations] Calculating distance from "${origin}" to "${destination}"`);

  if (!Maps_API_KEY) {
    console.error(`[${timestamp}] [calculateDistanceBetweenLocations] Google Maps API Key is not configured. Set Maps_API_KEY environment variable.`);
    // In a real app, you might want to throw an error or handle this more gracefully depending on requirements.
    return null; 
  }

  if (!origin || !destination) {
    console.warn(`[${timestamp}] [calculateDistanceBetweenLocations] Origin or destination is missing. Origin: "${origin}", Destination: "${destination}"`);
    return null;
  }

  // For more accurate results, especially with ambiguous addresses,
  // consider geocoding addresses to lat/lng coordinates first using the Geocoding API,
  // or using Place IDs from the Places API.
  const encodedOrigin = encodeURIComponent(origin);
  const encodedDestination = encodeURIComponent(destination);
  
  // units=metric returns distance in meters
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodedOrigin}&destinations=${encodedDestination}&units=metric&key=${Maps_API_KEY}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    // console.log(`[${timestamp}] [calculateDistanceBetweenLocations] Google API Response:`, JSON.stringify(data, null, 2));

    if (data.status !== 'OK') {
      console.error(`[${timestamp}] [calculateDistanceBetweenLocations] Google Distance Matrix API request failed. Status: ${data.status}. Error message: ${data.error_message || 'No error message provided.'}`);
      return null;
    }

    if (data.rows && data.rows.length > 0 && data.rows[0].elements && data.rows[0].elements.length > 0) {
      const element = data.rows[0].elements[0];
      if (element.status === 'OK') {
        const distanceInMeters = element.distance.value;
        const distanceInKm = parseFloat((distanceInMeters / 1000).toFixed(2)); // Convert to km and round to 2 decimal places
        console.log(`[${timestamp}] [calculateDistanceBetweenLocations] Successfully calculated distance: ${distanceInKm} km for ${origin} to ${destination}`);
        return distanceInKm;
      } else if (element.status === 'ZERO_RESULTS') {
        console.warn(`[${timestamp}] [calculateDistanceBetweenLocations] Google Distance Matrix API returned ZERO_RESULTS for origin "${origin}" and destination "${destination}". This means no route could be found.`);
        return null; // Or handle as 0 if that's preferred for no route found
      } else {
        console.error(`[${timestamp}] [calculateDistanceBetweenLocations] Google Distance Matrix API element status error for origin "${origin}" to destination "${destination}". Element status: ${element.status}.`);
        return null;
      }
    } else {
      console.error(`[${timestamp}] [calculateDistanceBetweenLocations] Google Distance Matrix API returned unexpected response structure or no results. Origins: ${data.origin_addresses}, Destinations: ${data.destination_addresses}`);
      return null;
    }
  } catch (error) {
    console.error(`[${timestamp}] [calculateDistanceBetweenLocations] Error calling Google Maps API for origin "${origin}" to destination "${destination}":`, error.response ? error.response.data : error.message);
    return null;
  }
}

// Example usage (you would call this from your server action, e.g., submitNewClaim):
/*
async function testDistance() {
  const origin = "Kwame Nkrumah Circle, Accra, Ghana";
  const destination = "University of Ghana, Legon, Accra, Ghana";
  const distance = await calculateDistanceBetweenLocations(origin, destination);
  if (distance !== null) {
    console.log(`The distance is: ${distance} km`);
  } else {
    console.log("Could not calculate the distance.");
  }
}
// testDistance();
*/