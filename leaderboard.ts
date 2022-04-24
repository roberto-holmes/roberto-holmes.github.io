let header = document.getElementsByTagName("h1");
let table = document.querySelector("table");

const duration_multiplier = 1; // Points per hour
const points_FL = 1;
const point_system = [25, 22, 20, 18, 17, 16, 15, 14, 13, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
// const point_system = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const races = [
	"./data\\20200905_australia_f1.json",
	"./data\\20200919_britain_f1.json",
	"./data\\20201003_canada_f1.json",
	"./data\\20201016_daytona_gt3.json",
	"./data\\20201017_belgium_f1.json",
	"./data\\20201024_lemans_gt3.json",
	"./data\\20201031_brazil_f1.json",
	"./data\\20201113_nurburgring_gt3.json",
	"./data\\20201114_bahrain_f1.json",
	"./data\\20201128_austria_f1.json",
	"./data\\20201211_1_silverstone_gt3.json",
	"./data\\20201211_1_silverstone_gt4.json",
	"./data\\20201211_2_silverstone_gt3.json",
	"./data\\20201211_2_silverstone_gt4.json",
	"./data\\20201212_netherlands_f1.json",
	"./data\\20201219_1_donington_btcc.json",
	"./data\\20201219_2_donington_btcc.json",
	"./data\\20210109_italy_f1.json",
	"./data\\20210116_1_nurburgring_gt3.json",
	"./data\\20210116_1_nurburgring_gt4.json",
	"./data\\20210116_2_nurburgring_gt3.json",
	"./data\\20210116_2_nurburgring_gt4.json",
	"./data\\20210123_spain_f1.json",
	"./data\\20210130_1_snetterton_btcc.json",
	"./data\\20210130_2_snetterton_btcc.json",
	"./data\\20210213_1_monza_gt3.json",
	"./data\\20210213_1_monza_gt4.json",
	"./data\\20210213_2_monza_gt3.json",
	"./data\\20210213_2_monza_gt4.json",
	"./data\\20210227_1_thruxton_btcc.json",
	"./data\\20210227_2_thruxton_btcc .json",
	"./data\\20210313_spa_gt3.json",
	"./data\\20210313_spa_gt4.json",
	"./data\\20210327_1_oulton_park_btcc.json",
	"./data\\20210327_2_oulton_park_btcc.json",
	"./data\\20210410_daytona_dpi.json",
	"./data\\20210410_daytona_gtlm.json",
	"./data\\20210410_daytona_lmp1.json",
	"./data\\20210417_bahrain_f1.json",
	"./data\\20210424_1_brands_hatch_btcc.json",
	"./data\\20210424_2_brands_hatch_btcc.json",
	"./data\\20210501_italy_f1.json",
	"./data\\20210508_1_laguna_seca_gt3.json",
	"./data\\20210508_2_laguna_seca_gt3.json",
	"./data\\20210515_canada_f1.json",
	"./data\\20210529_singapore_f1.json",
	"./data\\20210605_1_suzuka_gt3.json",
	"./data\\20210605_2_suzuka_gt3.json",
	"./data\\20210612_usa_f1.json",
	"./data\\20210619_indy500_indy.json",
	"./data\\20210710_nurbugring_gt3.json",
	"./data\\20210717_britain_f1.json",
	"./data\\20210724_1_kyalami_gt3.json",
	"./data\\20210724_2_kyalami_gt3.json",
	"./data\\20210814_bathurst_gt3.json",
	"./data\\20210828_lemans_dpi.json",
	"./data\\20210828_lemans_gt3.json",
	"./data\\20210828_lemans_lmp1.json",
	"./data\\20210924_donington_park_mx5.json",
	"./data\\20210924_donington_park_praga.json",
	"./data\\20211001_zandvoort_mx5.json",
	"./data\\20211001_zandvoort_praga.json",
	"./data\\20211008_silverstone_mx5.json",
	"./data\\20211008_silverstone_praga.json",
	"./data\\20211024_1_donington_park_gt4.json",
	"./data\\20211024_2_donington_park_gt4.json",
	"./data\\20211113_austria_f1.json",
	"./data\\20211120_1_snetterton_gt4.json",
	"./data\\20211120_2_snetterton_gt4.json",
	"./data\\20211127_italy_f1.json",
	"./data\\20211211_azerbaijan_f1.json",
	"./data\\20211218_1_oulton_park_gt4.json",
	"./data\\20211218_2_oulton_park_gt4.json",
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
	"./data\\20220423_1_hungary_gt3.json",
	"./data\\20220423_2_hungary_gt3.json",
];

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

let showTotalPoints = true;

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
	showTotalPoints = true;
	main();
}

function pointsPerHour() {
	showTotalPoints = false;
	main();
}

function generateTable() {
	// Null check and clear table
	if (table === null) return;
	table.innerHTML = "";
	// Create table header
	let table_head: string[] = [];
	if (showTotalPoints) table_head = ["Pos", "Δ", "Driver", "Points"];
	else table_head = ["Pos", "Δ", "Driver", "Points/h"];

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
		if (showTotalPoints) data = [d.position.toString(), d.delta_pos_str, d.name, d.points.toFixed(1)];
		else data = [d.position.toString(), d.delta_pos_str, d.name, d.points_per_hour.toFixed(2)];

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
	// For each race
	for (let i = 0; i < races.length; i++) {
		const race = races[i];
		// Extract data from json
		let data = await fetchJson(race);

		if (!has_extracted_data) {
			if (games.indexOf(data.game) == -1) games.push(data.game);
			if (series.indexOf(data.series) == -1) series.push(data.series);
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
				if (d.pos === "DNF") drivers[driver_index].addDNF();
				else drivers[driver_index].addResult(d.pos, data.duration);

				if (data.fastest_lap.includes(d.name)) drivers[driver_index].addFastestLap(data.duration);
			}
			drivers.sort((a, b) => {
				if (showTotalPoints) return b.points - a.points;
				else return b.points_per_hour - a.points_per_hour;
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
