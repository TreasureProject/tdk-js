export type Device = {
  device_name?: string;
  device_model?: string;
  device_unique_id?: string;
  device_os?: string;
};

export type AppInfo = {
  app_identifier: string;
  app_version: string;
  app_environment: 0 | 1; // 0 for dev, 1 for prod
};

export type PropertyValue =
  | string
  | number
  | boolean
  | { [key: string]: PropertyValue };

export type AnalyticsPayload = {
  cartridge_tag: string;
  name: string;

  time_server: number;
  time_local: number;

  smart_account: string;
  user_id?: string;

  id: string;

  session_id?: string;
  chain_id: number;

  device?: Device;
  app: AppInfo;

  properties: { [key: string]: PropertyValue | PropertyValue[] };
};
