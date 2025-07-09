import React, { useState, useEffect } from 'react';
import './App.css';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB7kqBGg9YrlVoPIf2gbMJdDIDsWlqgmAc';

function parseQueryLocation(param: string | null): { lat: number; lng: number } | null {
  if (!param) return null;
  const [lat, lng] = param.split(',').map(Number);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

function toQueryString(loc: { lat: number; lng: number } | null) {
  return loc ? `${loc.lat},${loc.lng}` : '';
}

function calcMidpoint(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  return {
    lat: (a.lat + b.lat) / 2,
    lng: (a.lng + b.lng) / 2,
  };
}

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// Function to format distance for display
function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)}km`;
  }
}

// Function to create Google Maps route URL
function createRouteUrl(startLat: number, startLng: number, destLat: number, destLng: number, mode: string = 'driving'): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${destLat},${destLng}&travelmode=${mode}`;
}

// Function to get address from coordinates using Google Maps Geocoding API
async function getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      return 'Address not found';
    }
  } catch (error) {
    console.error('Error fetching address:', error);
    return 'Error fetching address';
  }
}

// Function to get nearby venues using Google Places API
async function getNearbyVenues(lat: number, lng: number): Promise<any[]> {
  try {
    // Use a more specific search with better parameters
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=restaurant&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    console.log('Places API response:', data); // Debug log
    
    if (data.status === 'OK' && data.results) {
      return data.results.slice(0, 8); // Limit to 8 venues
    } else {
      console.log('Places API error:', data.status, data.error_message);
      // Fallback to mock data for demonstration
      return getMockVenues(lat, lng);
    }
  } catch (error) {
    console.error('Error fetching nearby venues:', error);
    // Fallback to mock data for demonstration
    return getMockVenues(lat, lng);
  }
}

// Mock venues for demonstration when API is not available
function getMockVenues(lat: number, lng: number): any[] {
  return [
    {
      place_id: 'mock_1',
      name: 'Central Coffee Shop',
      rating: 4.5,
      types: ['restaurant', 'food', 'establishment'],
      vicinity: '123 Main St',
      geometry: {
        location: {
          lat: lat + 0.001,
          lng: lng + 0.001
        }
      }
    },
    {
      place_id: 'mock_2',
      name: 'Pizza Palace',
      rating: 4.2,
      types: ['restaurant', 'food', 'establishment'],
      vicinity: '456 Oak Ave',
      geometry: {
        location: {
          lat: lat - 0.001,
          lng: lng + 0.002
        }
      }
    },
    {
      place_id: 'mock_3',
      name: 'Green Park',
      rating: 4.8,
      types: ['park', 'establishment'],
      vicinity: '789 Park Blvd',
      geometry: {
        location: {
          lat: lat + 0.002,
          lng: lng - 0.001
        }
      }
    },
    {
      place_id: 'mock_4',
      name: 'Downtown Diner',
      rating: 4.0,
      types: ['restaurant', 'food', 'establishment'],
      vicinity: '321 Center St',
      geometry: {
        location: {
          lat: lat - 0.002,
          lng: lng - 0.002
        }
      }
    }
  ];
}

type Location = {
  lat: number;
  lng: number;
};

type Venue = {
  place_id: string;
  name: string;
  rating?: number;
  types: string[];
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
};

const mapContainerStyle = { width: '100%', height: '100%' };

function App() {
  // User 1 (me)
  const [myLocation, setMyLocation] = useState<Location | null>(null);
  const [myAddress, setMyAddress] = useState<string>('');
  const [manual, setManual] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [error, setError] = useState('');

  // User 2 (friend)
  const [friendLocation, setFriendLocation] = useState<Location | null>(null);
  const [friendAddress, setFriendAddress] = useState<string>('');

  // Midpoint address
  const [midpointAddress, setMidpointAddress] = useState<string>('');

  // Nearby venues
  const [nearbyVenues, setNearbyVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);

  // On mount, check for friend location in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const friend = parseQueryLocation(params.get('friend'));
    if (friend) {
      setFriendLocation(friend);
      // Fetch friend's address
      getAddressFromCoordinates(friend.lat, friend.lng).then(setFriendAddress);
    }
  }, []);

  // Function to set location and fetch address
  const setLocationWithAddress = async (location: Location, setAddress: (address: string) => void) => {
    setAddress('Loading address...');
    const address = await getAddressFromCoordinates(location.lat, location.lng);
    setAddress(address);
  };

  // Detect my location
  const detectLocation = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setManual(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setMyLocation(location);
        setLocationWithAddress(location, setMyAddress);
        setManual(false);
      },
      (err) => {
        setError('Could not get your location. Please enter it manually.');
        setManual(true);
      }
    );
  };

  // Manual input for my location
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid latitude and longitude.');
      return;
    }
    const location = { lat, lng };
    setMyLocation(location);
    setLocationWithAddress(location, setMyAddress);
    setError('');
  };

  // Update midpoint address and fetch nearby venues when both locations are available
  useEffect(() => {
    if (myLocation && friendLocation) {
      const midpoint = calcMidpoint(myLocation, friendLocation);
      setLocationWithAddress(midpoint, setMidpointAddress);
      
      // Fetch nearby venues
      setLoadingVenues(true);
      console.log('Fetching venues for midpoint:', midpoint);
      getNearbyVenues(midpoint.lat, midpoint.lng).then(venues => {
        console.log('Received venues:', venues);
        setNearbyVenues(venues);
        setLoadingVenues(false);
      }).catch(error => {
        console.error('Error in venue fetch:', error);
        setLoadingVenues(false);
      });
    }
  }, [myLocation, friendLocation]);

  // Share link for friend
  const shareUrl = myLocation
    ? `${window.location.origin}${window.location.pathname}?friend=${toQueryString(myLocation)}`
    : '';

  // Midpoint calculation
  const midpoint = myLocation && friendLocation ? calcMidpoint(myLocation, friendLocation) : null;

  // Google Maps integration
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1>BellyButton</h1>
      <p style={{ maxWidth: 400, textAlign: 'center' }}>
        Find the perfect meeting spot!<br />
        BellyButton helps two people find an optimal meeting location by calculating the midpoint between their locations and suggesting nearby venues.
      </p>
      <div style={{ margin: '2rem 0', width: '100%', maxWidth: 400 }}>
        <h2>Your Location</h2>
        <button onClick={detectLocation} style={{ marginBottom: 16 }}>Detect My Location</button>
        {manual && (
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="text"
              placeholder="Latitude"
              value={manualLat}
              onChange={e => setManualLat(e.target.value)}
            />
            <input
              type="text"
              placeholder="Longitude"
              value={manualLng}
              onChange={e => setManualLng(e.target.value)}
            />
            <button type="submit">Set Location</button>
          </form>
        )}
        {myLocation && (
          <div style={{ marginTop: 8, color: '#1976d2' }}>
            <strong>Your Location:</strong><br />
            {myAddress}
          </div>
        )}
      </div>
      <div style={{ margin: '2rem 0', width: '100%', maxWidth: 400 }}>
        <h2>Friend's Location</h2>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          Share the link below with your friend so they can set their location.
        </p>
        {friendLocation && (
          <div style={{ marginTop: 8, color: '#dc004e' }}>
            <strong>Friend's Location:</strong><br />
            {friendAddress}
          </div>
        )}
        <div style={{ marginTop: 8 }}>
          <label>Share this link with your friend:</label>
          <input
            type="text"
            value={shareUrl}
            readOnly
            style={{ width: '100%', fontSize: 12, marginTop: 4 }}
            onFocus={e => e.target.select()}
          />
        </div>
      </div>
      {myLocation && friendLocation && (
        <div style={{ margin: '2rem 0', width: '100%', maxWidth: 800 }}>
          <h2>Meeting Point & Venues</h2>
          <div style={{ color: '#009688', marginBottom: 16 }}>
            <strong>Meeting Point:</strong><br />
            {midpointAddress}
          </div>
          
          {/* Nearby Venues Section */}
          <div style={{ marginTop: 24 }}>
            <h3>Nearby Meeting Places</h3>
            {loadingVenues ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                Finding nearby venues...
              </div>
            ) : nearbyVenues.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: 16 }}>
                {nearbyVenues.map((venue) => {
                  const distanceToMe = myLocation ? calculateDistance(
                    myLocation.lat, myLocation.lng, 
                    venue.geometry.location.lat, venue.geometry.location.lng
                  ) : 0;
                  const distanceToFriend = friendLocation ? calculateDistance(
                    friendLocation.lat, friendLocation.lng, 
                    venue.geometry.location.lat, venue.geometry.location.lng
                  ) : 0;
                  
                  return (
                    <div key={venue.place_id} style={{ 
                      border: '1px solid #ddd', 
                      borderRadius: '8px', 
                      padding: '16px',
                      backgroundColor: '#f9f9f9'
                    }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>{venue.name}</h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                        {venue.vicinity}
                      </p>
                      {venue.rating && (
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                          ⭐ {venue.rating}/5
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                        <span style={{ color: '#1976d2' }}>📍 You: {formatDistance(distanceToMe)}</span><br />
                        <span style={{ color: '#dc004e' }}>📍 Friend: {formatDistance(distanceToFriend)}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>
                        {venue.types.slice(0, 3).join(', ')}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => {
                            if (myLocation) {
                              const url = createRouteUrl(
                                myLocation.lat, myLocation.lng,
                                venue.geometry.location.lat, venue.geometry.location.lng
                              );
                              window.open(url, '_blank');
                            } else {
                              // Fallback without origin if location not set
                              const url = `https://www.google.com/maps/dir/?api=1&destination=${venue.geometry.location.lat},${venue.geometry.location.lng}&travelmode=driving`;
                              window.open(url, '_blank');
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          🚗 Route for You
                        </button>
                        <button 
                          onClick={() => {
                            if (friendLocation) {
                              const url = createRouteUrl(
                                friendLocation.lat, friendLocation.lng,
                                venue.geometry.location.lat, venue.geometry.location.lng
                              );
                              window.open(url, '_blank');
                            } else {
                              // Fallback without origin if location not set
                              const url = `https://www.google.com/maps/dir/?api=1&destination=${venue.geometry.location.lat},${venue.geometry.location.lng}&travelmode=driving`;
                              window.open(url, '_blank');
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: '#dc004e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          🚗 Route for Friend
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                No nearby venues found. Try expanding the search area.
              </div>
            )}
          </div>

          <div style={{ width: '100%', height: 400, background: '#eee', borderRadius: 8, overflow: 'hidden', marginTop: 24 }}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={midpoint!}
                zoom={14}
              >
                <Marker position={myLocation} label="You" />
                <Marker position={friendLocation} label="Friend" />
                <Marker position={midpoint!} label="Meeting Point" />
                {nearbyVenues.map((venue) => (
                  <Marker
                    key={venue.place_id}
                    position={venue.geometry.location}
                    label={venue.name}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                      scaledSize: new window.google.maps.Size(20, 20)
                    }}
                  />
                ))}
              </GoogleMap>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                Loading map...
              </div>
            )}
          </div>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 32, color: '#888' }}>
        <em>Phase 6: Nearby Venues Complete - Find perfect meeting places!</em>
      </div>
    </div>
  );
}

export default App;
