import * as firebase from 'firebase/app';
import { GeoPoint } from 'firebase/firestore';

export class Record {

    public route: string;
    public round: string;
    public program: string;
    public vehicle: string;
    public driver: string;
    public created: Date;
    public date: string;
    public geoPoint: GeoPoint;
    public location: string;
    public currentLocation: any;
    public event: string;
    public type: string; // to create on screen icon
    public description: string;
    public code: string;
    public format: string;
    public studentId: string;
    public studentName: string;
    public valid: boolean;
    public validUsage: boolean;
    public actualKey: string;
    public updateData: boolean;
    public boardingPassId?: string;
    public userId?: string;
    public routeId: string;
    public routeName: string;
    public routePath: string;
    public routeDescription: string;
    public customerPath: string;
    public name: string;
    public vehicleName: string;
    public vehicleId: string;
    public capacity: number;
    public isCredential: boolean;
    public credentialId: string;
    public customerName: string;
    public allowedOnBoard: boolean;
    public programId: string;

    public text: string; //deprecated
    public message: string; //deprecated
    public username: string; //deprecated
    public serviceType: string; //deprecated
    public icon: string; //deprecated
  
    constructor(assignment, event) {
  
      this.route = assignment.name;
      this.round = assignment.round;
      this.program = assignment.type;
      this.vehicle = assignment.vehicleName;
      this.driver = assignment.driver;
      this.created = new Date();
      this.date = new Date().toLocaleString();
      this.currentLocation = event.location;
      this.geoPoint = new GeoPoint(event.currentLocation.coords.latitude, event.currentLocation.coords.longitude);
      this.location = event.location;
      this.event = event.name;
      this.description = event.description;
      this.code = event.code;
      this.boardingPassId = event.boardingPassId || null;
      this.userId = event.userId;
      this.format = event.format;
      this.studentId = event.studentId || '';
      this.studentName = event.studentName || '';
      this.valid = event.valid;
      this.validUsage = event.validUsage;
      this.isCredential = event.isCredential;
      this.credentialId = event.credentialId;
      // console.log(event.updateData);
      this.updateData = event.updateData;
      this.type = event.type;
      this.actualKey = event.actualKey;
      this.allowedOnBoard = event.allowedOnBoard;
  
      this.routeId = assignment.routeId;
      this.routeName = assignment.routeName;
      this.routePath = assignment.routeId;
      this.routeDescription = assignment.routeDescription;
      this.customerPath = assignment.customerId;
      this.customerName = assignment.customerName;
      this.name = assignment.name;
      this.vehicleName = assignment.vehicleName;
      this.vehicleId = assignment.vehicleId;
      this.capacity = assignment.capacity;
      this.programId = assignment.id;
  
      this.iconSet();
    }
  
    private iconSet() {
  
      switch (this.type) {
        case 'beginRoute':
          this.icon = 'pin';
          break;
        case 'endRoute':
          this.icon = 'pin';
          break;
        case 'welcome':
          this.icon = 'globe';
          break;
        case 'geo:':
          this.icon = 'pin';
          break;
        case 'round':
          this.icon = 'warning';
          break;
        case 'route':
          this.icon = 'warning';
          break;
        case 'duplicate':
          this.icon = 'warning';
          break;
        case 'expired':
          this.icon = 'warning';
          break;
        case 'abuse':
            this.icon = 'warning';
            break;
        default:
          this.type = 'unknown';
          this.icon = 'warning';
      }
    }
  }
  