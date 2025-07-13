export interface WaterMeterRequest {
  meterId?: number;
  meterNumber: string;
  meterMark: string;
  active: boolean;
  created_at: Date;
}
export interface WaterMeterResponse {
  meterId: string;
  meterNnumber: string;
  meterMark: string;
  active: boolean;
  created_at: Date;
}

export interface GetAllWaterMeter {
  meterId: number;
  registerDate: Date;
  mark: string;
  serial: string;
  active: boolean;
}

export interface UpdatedWaterMeterRequest {
  idMeter: number;
  numberMeter: string;
  markMeter: string;
}

export interface UpdatedWaterMeterResponse {
  IdMeter: number;
  mensaje: string;
}