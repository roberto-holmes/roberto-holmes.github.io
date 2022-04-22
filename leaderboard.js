"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let header = document.getElementsByTagName("h1");
let table = document.querySelector("table");
const duration_multiplier = 1; // Points per hour
const points_FL = 1;
const point_system = [25, 22, 20, 18, 17, 16, 15, 14, 13, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const races = [
    "./data\\20211113_austria_f1.json",
    "./data\\20211127_imola_f1.json",
    "./data\\20211211_azerbaijan_f1.json",
    "./data\\20220108_france_f1.json",
    "./data\\20220122_monaco_f1.json",
    "./data\\20220129_portugal_f1.json",
    "./data\\20220130_mid_ohio_indy.json",
    "./data\\20220205_daytona_dpi.json",
    "./data\\20220205_daytona_gtlm.json",
    "./data\\20220205_daytona_lmp1.json",
    "./data\\20220212_japan_f1.json",
    "./data\\20220213_iowa_indy.json",
    "./data\\20220219_zolder_gt3.json",
    "./data\\20220226_hungary_f1.json",
    "./data\\20220227_long_beach_indy.json",
    "./data\\20220312_saudi_arabia_f1.json",
    "./data\\20220313_wwt_raceway_indy.json",
    "./data\\20220319_1_barcelona_gt3.json",
    "./data\\20220319_2_barcelona_gt3.json",
    "./data\\20220326_belgium_f1.json",
    "./data\\20220402_1_brands_hatch_gt3.json",
    "./data\\20220402_2_brands_hatch_gt3.json",
    "./data\\20220403_road_america_indy.json",
    "./data\\20220416_indy500_indy.json",
];
const table_head = ["Pos", "Δ", "Driver", "Points", "Races", "FLs", "DNFs"];
class Driver {
    constructor(name) {
        this.name = name;
        this.points = 0;
        this.fastest_lap_count = 0;
        this.DNF_count = 0;
        this.participated_races = 0;
        this.time_driven = 0;
        this.position = 0;
        this.delta_pos = 0;
        this.delta_pos_str = "";
        this.delta_pos_css_class = "";
    }
    addResult(pos, duration) {
        this.points += point_system[pos - 1] * duration * duration_multiplier;
        this.time_driven += duration;
        this.participated_races++;
    }
    addDNF() {
        this.DNF_count++;
        this.participated_races++;
    }
    addFastestLap(duration) {
        this.fastest_lap_count++;
        this.points += points_FL * duration * duration_multiplier;
    }
    updatePosition(pos) {
        if (this.position !== 0) {
            this.delta_pos = this.position - pos;
            if (this.delta_pos > 0) {
                this.delta_pos_str = "+" + this.delta_pos;
                this.delta_pos_css_class = "pos-up";
            }
            else if (this.delta_pos < 0) {
                this.delta_pos_str = this.delta_pos.toString();
                this.delta_pos_css_class = "pos-down";
            }
            else {
                this.delta_pos_str = "--";
                this.delta_pos_css_class = "pos-same";
            }
        }
        else {
            this.delta_pos_str = "**";
            this.delta_pos_css_class = "pos-up";
        }
        this.position = pos;
    }
}
let drivers = [];
function generateTable() {
    if (table === null)
        return;
    // Create table header
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let title of table_head) {
        let th = document.createElement("th");
        let text = document.createTextNode(title);
        th.appendChild(text);
        row.appendChild(th);
    }
    // Create and populate each row
    drivers.forEach((d) => {
        if (table === null)
            return;
        let row = table.insertRow();
        const data = [
            d.position.toString(),
            d.delta_pos_str,
            d.name,
            d.points.toFixed(1),
            d.participated_races.toString(),
            d.fastest_lap_count.toString(),
            d.DNF_count.toString(),
        ];
        for (let i = 0; i < data.length; i++) {
            let cell = row.insertCell();
            let text = document.createTextNode(data[i]);
            cell.appendChild(text);
            if (i === 1)
                cell.classList.add(d.delta_pos_css_class);
        }
    });
}
function fetchJson(race) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield fetch(race);
        let data = yield response.json();
        return data;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // For each race
        for (let i = 0; i < races.length; i++) {
            const race = races[i];
            // Extract data from json
            let data = yield fetchJson(race);
            // For each driver
            for (let j = 0; j < data.drivers.length; j++) {
                const d = data.drivers[j];
                let driver_index = drivers.findIndex((stored_driver) => stored_driver.name === d.name);
                // Check if driver already has an entry
                if (driver_index === -1) {
                    driver_index = drivers.push(new Driver(d.name)) - 1;
                }
                // Check for DNF
                if (d.pos === "DNF")
                    drivers[driver_index].addDNF();
                else
                    drivers[driver_index].addResult(d.pos, data.duration);
                if (data.fastest_lap.includes(d.name))
                    drivers[driver_index].addFastestLap(data.duration);
            }
            drivers.sort((a, b) => {
                return b.points - a.points;
            });
            let last_driver = { pos: 0, points: 0 };
            let joint_pos_count = 1;
            // Calculate leaderboard position for each driver
            for (let j = 0; j < drivers.length; j++) {
                if (drivers[j].points !== last_driver.points) {
                    last_driver.pos += joint_pos_count;
                    last_driver.points = drivers[j].points;
                    joint_pos_count = 1;
                }
                else
                    joint_pos_count++;
                drivers[j].updatePosition(last_driver.pos);
            }
        }
        generateTable();
    });
}
main();
