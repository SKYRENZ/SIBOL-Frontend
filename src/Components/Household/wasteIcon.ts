import L from 'leaflet';

const wasteIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#355842" width="32px" height="32px"><path d="M9 2L8 3H4V5H20V3H16L15 2H9ZM5 7V21C5 22.1 5.9 23 7 23H17C18.1 23 19 22.1 19 21V7H5ZM9 9H11V21H9V9ZM13 9H15V21H13V9Z"/></svg>`;

const wasteIcon = new L.DivIcon({
  html: wasteIconSvg,
  className: 'leaflet-div-icon-transparent', // Use a transparent background
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default wasteIcon;