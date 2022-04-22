import csv
import json
from glob import glob

input_files = glob("./data_csv/*.csv")
output_dir = "./data"

for file in input_files:
    with open(file, newline="") as f:
        reader = csv.reader(f)

        output_object = {}
        drivers = []

        for i, row in enumerate(reader):
            if i == 0:
                output_object["track"] = row[0]
                output_object["event"] = row[1]
                output_object["duration"] = row[2]
                output_object["date"] = row[3]
            elif i == 1:
                output_object["fastest_lap"] = []
                for element in row:
                    output_object["fastest_lap"].append(element)

            else:
                drivers.append({"name": row[1], "pos": row[0]})

        output_object["drivers"] = drivers

        with open(output_dir + file[file.find("\\") : -4] + ".json", "w") as output:
            output.write(json.dumps(output_object))

output_files = glob(output_dir + "/*.json")
print(output_files)
