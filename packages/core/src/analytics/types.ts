export type Device = {
  device_name?: string; // device name if known>
  device_model?: string; // device model if known
  device_unique_id?: string; // unique identifier for device
  device_os?: string; // device os if known
};

export type AppInfo = {
  app_identifier: string; // bundle/package name of ap e.g. lol.treasure.tdkjs
  app_version: string; // version of app e.g. 0.1,
  app_environment: 0 | 1; // 0 for dev, 1 for prod
};

export type PropertyValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: PropertyValue | PropertyValue[] };

type PlayerIdPayload =
  | {
      smart_account: string; // Ethereum wallet address for player. Lowercase.
      user_id?: undefined; // Optional if smart_account is defined.
    }
  | {
      user_id: string; // Required if smart_account is undefined. Can be player ID or email, etc.
      smart_account?: string; // Optional if user_id is defined.
    };

export type AnalyticsPayload = PlayerIdPayload & {
  cartridge_tag: string; // Value is assigned to you by Treasure.
  name: string; // Name of this type of event. You decide this value.

  time_server: string; // Server UNIX milliseconds.
  time_local?: string; // UNIX milliseconds of event at originating device.

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

  tdk_flavour: string; // tdk-js
  tdk_version: string; // version from package.json
};

export type TrackableEvent = PlayerIdPayload & {
  cartridge_tag: string;
  name: string;
  properties: { [key: string]: PropertyValue | PropertyValue[] };
};
