let header = document.getElementsByTagName("h1");
let table = document.querySelector("table");

const duration_multiplier = 1; // Points per hour
const points_FL = 1;
const point_system = [25, 22, 20, 18, 17, 16, 15, 14, 13, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
// const point_system = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const races_file = './data\\data.json';

class Driver {
	name: string;
	points: number;
	points_per_hour: number;
	fastest_lap_count: number;
	DNF_count: number;
	participated_races: number;
	time_driven: number;
	position: number;
	delta_pos: number;
	delta_pos_str: string;
	delta_pos_css_class: string;

	constructor(name: string) {
		this.name = name;
		this.points = 0;
		this.points_per_hour = 0;
		this.fastest_lap_count = 0;
		this.DNF_count = 0;
		this.participated_races = 0;
		this.time_driven = 0;
		this.position = 0;
		this.delta_pos = 0;
		this.delta_pos_str = "";
		this.delta_pos_css_class = "";
	}
	addResult(pos: number, duration: number) {
		// Give 1 point if the driver finished "outside of the points"
		if (pos <= point_system.length) this.points += point_system[pos - 1] * duration * duration_multiplier;
		else this.points += 1 * duration * duration_multiplier;

		this.time_driven += Number(duration);
		this.points_per_hour = this.points / this.time_driven;
		this.participated_races++;
	}
	addDNF() {
		this.DNF_count++;
		this.participated_races++;
	}
	addFastestLap(duration: number) {
		this.fastest_lap_count++;
		this.points += points_FL * duration * duration_multiplier;
	}
	updatePosition(pos: number) {
		if (this.position !== 0) {
			this.delta_pos = this.position - pos;
			if (this.delta_pos > 0) {
				this.delta_pos_str = "+" + this.delta_pos;
				this.delta_pos_css_class = "pos-up";
			} else if (this.delta_pos < 0) {
				this.delta_pos_str = this.delta_pos.toString();
				this.delta_pos_css_class = "pos-down";
			} else {
				this.delta_pos_str = "--";
				this.delta_pos_css_class = "pos-same";
			}
		} else {
			this.delta_pos_str = "**";
			this.delta_pos_css_class = "pos-up";
		}
		this.position = pos;
	}
}

let drivers: Driver[] = [];
let series: string[] = [];
let allowed_series: string[] = [];
let games: string[] = [];
let allowed_games: string[] = [];

let table_sorting_criterion = "total";

let is_filtering_series = false;
let is_filtering_game = false;

let has_extracted_data = false;

function selectAllRaces() {
	allowed_games = [...games];
	allowed_series = [...series];
	let filter_container = document.getElementById("filters");
	if (filter_container) filter_container.innerHTML = "";
	is_filtering_series = false;
	is_filtering_game = false;
	main();
}

function selectNoSeries() {
	allowed_series = [];
	// Clear checkboxes
	series.forEach((s) => {
		let checkbox = <HTMLInputElement>document.getElementById(s.replaceAll(" ", "-"));
		checkbox.checked = false;
	});
	main();
}

function selectNoGames() {
	allowed_games = [];
	// Clear checkboxes
	games.forEach((g) => {
		let checkbox = <HTMLInputElement>document.getElementById(g.replaceAll(" ", "-"));
		checkbox.checked = false;
	});
	main();
}

// If the series is currently not allowed, add it. If it is allowed, remove it from the array
function toggleAllowedSeries(s: string) {
	const series_index = allowed_series.indexOf(s);
	if (series_index === -1) allowed_series.push(s);
	else allowed_series.splice(series_index, 1);
	main();
}

function toggleAllowedGame(g: string) {
	// console.log(allowed_games);
	const game_index = allowed_games.indexOf(g);
	if (game_index === -1) allowed_games.push(g);
	else allowed_games.splice(game_index, 1);
	// console.log(allowed_games);
	main();
}

function filterBySeries() {
	let filter_container = document.getElementById("filters");
	if (filter_container === null) return;
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
			if (allowed_series.indexOf(s) !== -1) checked_text = "checked";
			if (filter_container === null) return;
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
	} else {
		filter_container.innerHTML = "";
		is_filtering_series = false;
	}
}

function filterByGame() {
	let filter_container = document.getElementById("filters");
	if (filter_container === null) return;
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
			if (allowed_games.indexOf(g) !== -1) checked_text = "checked";
			if (filter_container === null) return;
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
	} else {
		filter_container.innerHTML = "";
		is_filtering_game = false;
	}
}

function totalPoints() {
	table_sorting_criterion = "total";
	main();
}

function pointsPerHour() {
	table_sorting_criterion = "pph";
	main();
}

function raceCount() {
	table_sorting_criterion = "race count";
	main();
}

function generateTable() {
	// Null check and clear table
	if (table === null) return;
	table.innerHTML = "";
	// Create table header
	let table_head: string[] = [];
	if (table_sorting_criterion === "total") table_head = ["Pos", "Δ", "Driver", "Points"];
	else if (table_sorting_criterion === "pph") table_head = ["Pos", "Δ", "Driver", "Points", "Points/h", "Races"];
	else if (table_sorting_criterion === "race count") table_head = ["Pos", "Δ", "Driver", "Points", "Points/h", "Races"];
	else throw "Invalid sorting criterion";

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
		if (table === null) return;
		let row = table.insertRow();
		row.classList.add("table-row");
		row.onclick = function () {
			console.log(d.name + " has " + d.points + " points");
		};

		let data: string[] = [];
		if (table_sorting_criterion === "total") data = [d.position.toString(), d.delta_pos_str, d.name, d.points.toFixed(1)];
		else if (table_sorting_criterion === "pph")
			data = [d.position.toString(), d.delta_pos_str, d.name, d.points.toFixed(1), d.points_per_hour.toFixed(2), d.participated_races.toString()];
		else if (table_sorting_criterion === "race count")
			data = [d.position.toString(), d.delta_pos_str, d.name, d.points.toFixed(1), d.points_per_hour.toFixed(2), d.participated_races.toString()];
		else throw "Invalid sorting criterion";

		for (let i = 0; i < data.length; i++) {
			let cell = row.insertCell();
			let text = document.createTextNode(data[i]);
			cell.appendChild(text);
			if (i === 1) cell.classList.add(d.delta_pos_css_class);
		}
	});
}

async function fetchJson(race: string) {
	let response = await fetch(race);
	let data = await response.json();
	return data;
}

async function main(callback?: () => void) {
	let race_count = 0;
	drivers = [];

	// Extract data from json
	let all_data = await fetchJson(races_file);
		
	// For each race
	for (let i = 0; i < all_data.race.length; i++) {
		const data = all_data.race[i];

		if (!has_extracted_data) {
			if (games.indexOf(data.game) == -1) games.push(data.game);
			if (series.indexOf(data.series) == -1) series.push(data.series);
		}

		if (allowed_games.length != 0 && allowed_series.length != 0 && allowed_games.includes(data.game) && allowed_series.includes(data.series)) {
			// For each driver
			for (let j = 0; j < data.drivers.length; j++) {
				const d = data.drivers[j];

				let driver_index = drivers.findIndex((stored_driver) => stored_driver.name === d.name);
				// Check if driver already has an entry
				if (driver_index === -1) {
					driver_index = drivers.push(new Driver(d.name)) - 1;
				}
				// Check for DNF
				if (d.pos === "DNF") drivers[driver_index].addDNF();
				else drivers[driver_index].addResult(d.pos, data.duration);

				if (data.fastest_lap.includes(d.name)) drivers[driver_index].addFastestLap(data.duration);
			}
			drivers.sort((a, b) => {
				if (table_sorting_criterion === "total") return b.points - a.points;
				else if (table_sorting_criterion === "pph") return b.points_per_hour - a.points_per_hour;
				else if (table_sorting_criterion === "race count") return b.participated_races - a.participated_races;
				else throw "Invalid sorting criterion";
			});

			let last_driver = { pos: 0, points: 0 };
			let joint_pos_count = 1;

			// Calculate leaderboard position for each driver
			for (let j = 0; j < drivers.length; j++) {
				if (drivers[j].points !== last_driver.points) {
					last_driver.pos += joint_pos_count;
					last_driver.points = drivers[j].points;
					joint_pos_count = 1;
				} else joint_pos_count++;
				drivers[j].updatePosition(last_driver.pos);
			}
			race_count++;
		}
	}
	has_extracted_data = true;

	// Generate HTML
	let race_count_display = document.getElementById("race-count-display");
	if (race_count_display) race_count_display.innerHTML = drivers.length + " drivers and " + race_count + " races";
	generateTable();
	if (callback) callback();
}
main(selectAllRaces);
