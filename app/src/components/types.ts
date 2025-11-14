export type OccupantType = "tenant" | "guest";

export type VehicleSlot = "primary" | "secondary";

export interface ParkingRegistration {
  id: string;
  createdAt: string;
  occupantName: string;
  occupantType: OccupantType;
  email: string;
  phone: string;
  vehicleSlot: VehicleSlot;
  vehiclePlate: string;
  vehicleMake: string;
  vehicleColor: string;
  hoursApproved: number;
  notes?: string;
  status: "approved" | "parked" | "completed";
  notifiedAt: string;
}

export interface NotificationMessage {
  id: string;
  headline: string;
  details: string;
  createdAt: string;
}
