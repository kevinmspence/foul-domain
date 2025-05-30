// utils/showBackgrounds.js

export function getShowBackground(show) {
  const showSpecificImages = {
    '1997-11-22': '/shows/1997-11-22.png',
    '1995-12-31': '/shows/1995-12-31.png',
    // Add more show-specific overrides
  };

  const venueImages = {
    'Madison Square Garden': '/venues/msg.png',
    'Red Rocks Amphitheatre': '/venues/red-rocks.png',
    'Alpine Valley Music Theatre': '/venues/alpine-valley.png',
    // Add more venue mappings
  };

  return (
    showSpecificImages[show.showDate] ||
    venueImages[show.venue] ||
    '/default.png'
  );
}
