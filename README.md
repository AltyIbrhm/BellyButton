# 🎯 HealthyBot - Smart Meeting Point Finder

HealthyBot is an intelligent web application that helps two people find the perfect meeting location by calculating the midpoint between their locations and suggesting nearby venues like restaurants, cafes, and parks.

## ✨ Features

### 🗺️ **Smart Location Detection**
- **Automatic GPS Detection**: Instantly detect your current location
- **Manual Input**: Enter coordinates manually if needed
- **Address Conversion**: Convert coordinates to human-readable addresses

### 🤝 **Easy Sharing**
- **One-Click Sharing**: Generate a shareable link for your friend
- **URL Parameters**: Friend's location is automatically loaded via URL
- **Cross-Platform**: Works on any device with a web browser

### 📍 **Intelligent Meeting Point**
- **Midpoint Calculation**: Automatically finds the optimal meeting point
- **Address Display**: Shows the exact address of the meeting point
- **Interactive Map**: Visual representation with markers for both users

### 🏪 **Venue Suggestions**
- **Nearby Venues**: Find restaurants, cafes, parks, and other meeting places
- **Distance Display**: See how far each venue is from both people
- **Ratings & Types**: View venue ratings and categories
- **Route Planning**: Get directions from both locations to any venue

### 🚗 **Navigation Integration**
- **Google Maps Routes**: One-click directions to any venue
- **Personalized Routes**: Routes from your location and friend's location
- **Multiple Transport Options**: Driving directions (expandable to walking, transit)

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AltyIbrhm/HealthyBot.git
   cd HealthyBot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Google Maps API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Geocoding API
     - Places API (optional, for venue suggestions)
   - Create an API key and restrict it to your domain
   - Replace `GOOGLE_MAPS_API_KEY` in `src/App.tsx` with your API key

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 How to Use

### Step 1: Set Your Location
1. Click "Detect My Location" to automatically get your GPS coordinates
2. Or manually enter your latitude and longitude if needed
3. Your address will be displayed automatically

### Step 2: Share with Friend
1. Copy the generated share link
2. Send it to your friend via text, email, or messaging app
3. When they open the link, their location will be automatically detected

### Step 3: Find Meeting Places
1. Once both locations are set, the app calculates the midpoint
2. View nearby venues with distances from both people
3. Click "Route for You" or "Route for Friend" to get directions
4. Choose the most convenient meeting place!

## 🛠️ Technical Details

### Built With
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Google Maps API** - Maps, geocoding, and places
- **Vite** - Fast build tool and dev server

### API Integration
- **Google Maps JavaScript API** - Interactive maps and markers
- **Google Geocoding API** - Convert coordinates to addresses
- **Google Places API** - Find nearby venues (with fallback mock data)

### Key Components
- **Location Detection**: GPS and manual input
- **Midpoint Calculation**: Haversine formula for accurate distances
- **Venue Discovery**: Nearby search with distance calculations
- **Route Generation**: Google Maps integration for directions

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### API Key Setup
1. **Enable APIs** in Google Cloud Console:
   - Maps JavaScript API
   - Geocoding API
   - Places API (for venue suggestions)

2. **Restrict API Key** for security:
   - HTTP referrers: `localhost:3000/*`, `yourdomain.com/*`
   - API restrictions: Only the APIs you need

## 🎨 Customization

### Styling
- Modify `src/App.css` for custom styles
- Update color schemes in the component styles
- Adjust layout in the main App component

### Features
- Add more venue types in `getNearbyVenues()`
- Implement walking/transit directions
- Add venue filtering options
- Integrate with other mapping services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Maps Platform for mapping and geocoding services
- React community for the excellent framework
- Open source contributors who made this possible

## 📞 Support

If you have any questions or need help setting up the project, please open an issue on GitHub.

---

**Made with ❤️ for healthier meetups and better planning!**
