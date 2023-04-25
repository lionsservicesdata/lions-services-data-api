export class QR {
    id: number;
    station_name: string;
    lot_number: number;
    production_system_name: string;
    bundle_size: number;
    scanned: string;
    date_created: string;
    date_scanned: string;
    qr_string: string;

    constructor(id: number, station_name: string, lot_number: number, production_system_name: string, bundle_size: number, scanned: string, date_created: string, date_scanned: string, qr_string: string) {
        this.id = id;
        this.station_name = station_name;
        this.lot_number = lot_number;
        this.production_system_name = production_system_name;
        this.bundle_size = bundle_size;
        this.scanned = scanned;
        this.date_created = date_created;
        this.date_scanned = date_scanned;
        this.qr_string = qr_string;
    }
}



