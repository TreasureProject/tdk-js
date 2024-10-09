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
  | null
  | { [key: string]: PropertyValue | PropertyValue[] };

export type PlayerIdPayload =
  | {
      smart_account: string; // Ethereum wallet address for player. Lowercase.
      user_id: undefined; // Omitted if smart_account is defined.
    }
  | {
      user_id: string; // Required if smart_account is undefined. Can be player ID or email, etc.
      smart_account: undefined; // Omitted if user_id is defined.
    };

export type AnalyticsPayload = PlayerIdPayload & {
  cartridge_tag: string; // Value is assigned to you by Treasure.
  name: string; // Name of this type of event. You decide this value.

  time_server: number; // Server UNIX milliseconds.
  time_local?: number; // UNIX milliseconds of event at originating device.

  id: string; // Required. Unique identifier for this event.
  // Used as a database upsert key to filter out duplicate updates.

  op?: "upsert" | "u" | "delete" | "d"; // Optional. A field indicating whether to upsert/delete the
  // database entry specified in id. Valid values:
  //   "upsert" / "u"
  //   "delete" / "d"
  // In the absence of an 'op', default behavior is to upsert.

  // Event-specific properties. Up to 500 KB.
  properties: { [key: string]: PropertyValue | PropertyValue[] };

  // Other metadata. Device and app telemetry.
  session_id?: string; // Optional. Unique Session ID. Helps w/ analytics.
  chain_id?: number; // Optional. Chain ID.

  // Device telemetry.
  device?: Device;
  // App telemetry.
  app: AppInfo;
};
