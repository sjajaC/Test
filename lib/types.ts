export type SpotKind = "area" | "cafe" | "bar" | "restaurant";

export interface SmokingSpot {
  id: string;
  name: string;
  nameJa?: string;
  kind: SpotKind;
  lat: number;
  lng: number;
  smokingTag?: string;
  amenityTag?: string;
  openingHours?: string;
  address?: string;
  website?: string;
  osmUrl: string;
  raw: Record<string, string>;
}
