export class Models {
}

export interface IUserData {
    address: {
        addressLine: string;
        city: string;
        postCode: string;
        state: string;
    },
    customerId: string;
    customerName: string;
    displayName: string;
    defaultRoute: string;
    email: string;
    emailVerified: boolean;
    firstName: string;
    id: string;
    lastName: string;
    occupation: string;
    openpay: {
        address: string;
        clabe: string;
        creation_date: string;
        email: string;
        external_id: string;
        id: string;
        last_name: string;
        name: string;
        phone_number: string;
    },
    phone: string;
    photoURL: string;
    refreshToken: string;
    roles: [IRoles];
    socialNetworks: {
        apple: string;
        facebook: string;
        google: string;
        instagram: string;
        linkedIn: string;
        twitter: string;
    }
    studentId: string;
    uid: string;
    username: string;
    _isEditMode: boolean;
    _userId: string;
}

export interface IRoles {
    user: true,
    admin: true,
    editor: true
}

export class Device {

    constructor(
      public id?: number,
      public groupId?: number,
      public name?: string,
      public uniqueId?: number,
      public status?: string,
      public lastUpdate?: string,
      public positionId?: number,
      public geofenceIds?: any[],
      public phone?: number,
      public model?: string,
      public contact?: string,
      public category?: string,
      public disabled?: boolean
    ) {}
  
  }

  export const deviceEvents = {
      1: "speed_alert",
      2: "unauthorized_movement",
      3: "engine_on",
      4: "engine_off",
      5: "panic",
      6: "position",
      7: "hook",
      8: "release",
      9: "low_battery",
      10: "init_chage",
      11: "end_chage",
      12: "poleo",
      13: "call_poleo",
      14: "door_open",
      15: "door_close",
      16: "engine_stop_active",
      17: "engine_stop_deactivated",
      18: "power_disconnection",
      19: "power_connection",
      20: "temperature",
      21: "gas",
      22: "device_off",
      23: "zone_in",
      24: "zone_out",
      25: "turn",
      26: "on_motion",
      27: "off_motion",
      28: "ralenti",
      29: "backup_energy_position",
      30: "periodic_reset",
      31: "unhook",
      32: "magnetic_lock_open",
      33: "magnetic_lock_close",
      34: "acceleration",
      35: "braking"
    };