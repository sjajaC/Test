export interface City {
  id: string;
  name: string;
  nameJa: string;
  bbox: [number, number, number, number]; // south, west, north, east
  center: [number, number];
  zoom: number;
}

export const CITIES: City[] = [
  {
    id: "tokyo",
    name: "Tokyo",
    nameJa: "東京",
    bbox: [35.5, 139.4, 35.9, 139.95],
    center: [35.6812, 139.7671],
    zoom: 12,
  },
  {
    id: "yokohama",
    name: "Yokohama",
    nameJa: "横浜",
    bbox: [35.3, 139.45, 35.55, 139.75],
    center: [35.4437, 139.638],
    zoom: 12,
  },
  {
    id: "osaka",
    name: "Osaka",
    nameJa: "大阪",
    bbox: [34.55, 135.3, 34.8, 135.65],
    center: [34.6937, 135.5023],
    zoom: 12,
  },
  {
    id: "kyoto",
    name: "Kyoto",
    nameJa: "京都",
    bbox: [34.85, 135.65, 35.1, 135.85],
    center: [35.0116, 135.7681],
    zoom: 12,
  },
  {
    id: "nagoya",
    name: "Nagoya",
    nameJa: "名古屋",
    bbox: [35.05, 136.8, 35.25, 137.05],
    center: [35.1815, 136.9066],
    zoom: 12,
  },
  {
    id: "fukuoka",
    name: "Fukuoka",
    nameJa: "福岡",
    bbox: [33.5, 130.3, 33.65, 130.5],
    center: [33.5904, 130.4017],
    zoom: 12,
  },
  {
    id: "sapporo",
    name: "Sapporo",
    nameJa: "札幌",
    bbox: [42.95, 141.25, 43.15, 141.45],
    center: [43.0618, 141.3545],
    zoom: 12,
  },
];

export function getCity(id: string): City {
  return CITIES.find((c) => c.id === id) ?? CITIES[0];
}
