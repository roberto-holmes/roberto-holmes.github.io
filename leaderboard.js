"use strict";
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
const table_head = ["Pos", "Δ", "Driver", "Points"]; //, "Races", "FLs", "DNFs"];
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
let series = [];
let allowed_series = [];
let games = [];
let allowed_games = [];
let is_filtering_series = false;
let is_filtering_game = false;
let has_extracted_data = false;
function selectAllRaces() {
    allowed_games = [...games];
    allowed_series = [...series];
    let filter_container = document.getElementById("filters");
    if (filter_container)
        filter_container.innerHTML = "";
    is_filtering_series = false;
    is_filtering_game = false;
    main();
}
function selectNoSeries() {
    console.log("no series");
    allowed_series = [];
    // Clear checkboxes
    series.forEach((s) => {
        console.log("Looking for " + s.replaceAll(" ", "-"));
        let checkbox = document.getElementById(s.replaceAll(" ", "-"));
        console.log(checkbox);
        checkbox.checked = false;
    });
    main();
}
function selectNoGames() {
    console.log("no games");
    allowed_games = [];
    // Clear checkboxes
    games.forEach((g) => {
        console.log("Looking for " + g.replaceAll(" ", "-"));
        let checkbox = document.getElementById(g.replaceAll(" ", "-"));
        console.log(checkbox);
        checkbox.checked = false;
    });
    main();
}
// If the series is currently not allowed, add it. If it is allowed, remove it from the array
function toggleAllowedSeries(s) {
    const series_index = allowed_series.indexOf(s);
    if (series_index === -1)
        allowed_series.push(s);
    else
        allowed_series.splice(series_index, 1);
    main();
}
function toggleAllowedGame(g) {
    // console.log(allowed_games);
    const game_index = allowed_games.indexOf(g);
    if (game_index === -1)
        allowed_games.push(g);
    else
        allowed_games.splice(game_index, 1);
    // console.log(allowed_games);
    main();
}
function filterBySeries() {
    let filter_container = document.getElementById("filters");
    if (filter_container === null)
        return;
    if (!is_filtering_series) {
        is_filtering_game = false;
        is_filtering_series = true;
        // Get the element where the possible series will be displayed and clear it
        filter_container.innerHTML = "";
        // Add an option to clear selection
        filter_container.innerHTML += '<div onclick="selectNoSeries()">Clear Selection</div>';
        // Add an option for each series
        series.forEach((s) => {
            let checked_text = "";
            if (allowed_series.indexOf(s) !== -1)
                checked_text = "checked";
            if (filter_container === null)
                return;
            filter_container.innerHTML +=
                '<div><input type="checkbox" id=' +
                    s.replaceAll(" ", "-") +
                    ' onclick="toggleAllowedSeries(' +
                    "'" +
                    s +
                    "'" +
                    ')" ' +
                    checked_text +
                    "><label for=" +
                    s.replaceAll(" ", "-") +
                    ">" +
                    s +
                    "</label></div>";
        });
    }
    else {
        filter_container.innerHTML = "";
        is_filtering_series = false;
    }
}
function filterByGame() {
    let filter_container = document.getElementById("filters");
    if (filter_container === null)
        return;
    if (!is_filtering_game) {
        is_filtering_series = false;
        is_filtering_game = true;
        // Get the element where the possible series will be displayed and clear it
        filter_container.innerHTML = "";
        // Add an option to clear selection
        filter_container.innerHTML += '<div onclick="selectNoGames()">Clear Selection</div>';
        // Add an option for each series
        games.forEach((g) => {
            let checked_text = "";
            if (allowed_games.indexOf(g) !== -1)
                checked_text = "checked";
            if (filter_container === null)
                return;
            filter_container.innerHTML +=
                '<div><input type="checkbox" id=' +
                    g.replaceAll(" ", "-") +
                    ' onclick="toggleAllowedGame(' +
                    "'" +
                    g +
                    "'" +
                    ')" ' +
                    checked_text +
                    "><label for=" +
                    g.replaceAll(" ", "-") +
                    ">" +
                    g +
                    "</label></div>";
        });
    }
    else {
        filter_container.innerHTML = "";
        is_filtering_game = false;
    }
}
function generateTable() {
    // Null check and clear table
    if (table === null)
        return;
    table.innerHTML = "";
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
        row.classList.add("table-row");
        row.onclick = function () {
            console.log(d.name);
        };
        const data = [d.position.toString(), d.delta_pos_str, d.name, d.points.toFixed(1)];
        // 	,
        // 	d.participated_races.toString(),
        // 	d.fastest_lap_count.toString(),
        // 	d.DNF_count.toString(),
        // ];
        for (let i = 0; i < data.length; i++) {
            let cell = row.insertCell();
            let text = document.createTextNode(data[i]);
            cell.appendChild(text);
            if (i === 1)
                cell.classList.add(d.delta_pos_css_class);
        }
    });
}
async function fetchJson(race) {
    let response = await fetch(race);
    let data = await response.json();
    return data;
}
async function main(callback) {
    let race_count = 0;
    drivers = [];
    // For each race
    for (let i = 0; i < races.length; i++) {
        const race = races[i];
        // Extract data from json
        let data = await fetchJson(race);
        if (!has_extracted_data) {
            if (games.indexOf(data.game) == -1)
                games.push(data.game);
            if (series.indexOf(data.series) == -1)
                series.push(data.series);
        }
        if (allowed_games.length != 0 && allowed_series.length != 0 && allowed_games.includes(data.game) && allowed_series.includes(data.series)) {
            // console.log("inside");
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
            race_count++;
        }
    }
    has_extracted_data = true;
    // Generate HTML
    let race_count_display = document.getElementById("race-count-display");
    if (race_count_display)
        race_count_display.innerHTML = race_count + " total races";
    generateTable();
    if (callback)
        callback();
}
main(selectAllRaces);
