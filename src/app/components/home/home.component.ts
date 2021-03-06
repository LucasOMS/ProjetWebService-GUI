import {Component, OnInit} from '@angular/core';
import {VelibService} from "../../services/velib.service";
import {MatSelectChange} from "@angular/material";
import {Station} from "../../models/station";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    cities: string[];
    bikes: string[];
    stations: Station[];

    selected_city = undefined;
    selected_station: Station;
    center: { longitude: number, latitude: number };
    stationOfInfoWindows: Station;

    constructor(private velibService: VelibService) {
    }

    async ngOnInit() {
        this.cities = await this.velibService.getCities();
    }

    async selectCity(event: MatSelectChange) {
        this.selected_city = event.value;
        this.stations = undefined;
        console.log(this.selected_city);
        if (this.selected_city !== undefined) {
            const res = await this.velibService.getStationsOf(this.selected_city);
            res.sort((station1, station2) => {
                if (station1.number > station2.number) {
                    return 1;
                } else if (station1.number === station2.number) {
                    return 0;
                } else {
                    return -1;
                }
            });
            // Compute center of the city
            let sumX = 0.0;
            let sumY = 0.0;
            for (const station of res) {
                sumX += station.position.longitude;
                sumY += station.position.latitude;
            }
            this.center = {
                longitude: sumX / res.length,
                latitude: sumY / res.length,
            };
            this.stations = res;
        }
    }

    async changeStation(station: Station) {
        this.stationOfInfoWindows = station;
        this.selected_station = station;
        // Update data with lazy load
        this.selected_station = await this.velibService.retrieveDataFor(station);
        this.stationOfInfoWindows = this.selected_station;

    }
}
