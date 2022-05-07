import os
import csv
import json
import pandas as pd
from glob import glob

input_dir = "./data_csv/"
input_files = glob(input_dir + "*.csv")
output_dir = "./data"


def createJson():
    # Clear output directory
    old_files = glob(output_dir + "/*.json")
    for f in old_files:
        os.remove(f)
    output_object = {}
    output_object["race"] = []
    for file in input_files:
        with open(file, newline="") as f:
            reader = csv.reader(f)

            race_object = {}
            drivers = []
            for i, row in enumerate(reader):
                if i == 0:
                    race_object["track"] = row[0]
                    race_object["event"] = row[1]
                    race_object["duration"] = row[2]
                    race_object["date"] = file[len(input_dir) : len(input_dir) + 8]
                    race_object["game"] = row[3]
                    race_object["series"] = row[4]
                elif i == 1:
                    race_object["fastest_lap"] = []
                    for element in row:
                        if element != "":
                            race_object["fastest_lap"].append(element)

                else:
                    drivers.append({"name": row[1], "pos": row[0]})

            race_object["drivers"] = drivers

            # Add race data to the array of all races
            output_object["race"].append(race_object)

    # Create or overwrite a JSON file to store all race data
    with open(output_dir + "/data.json", "w") as output:
        output.write(json.dumps(output_object))

    # Print path to output file to copy into the ts file
    output_files = glob(output_dir + "/*.json")
    print(output_files)


def modifyCsv():
    # Remove date from the header of the file
    for file in input_files:
        df = pd.read_csv(file)
        if len(df.columns) == 6:
            df.drop(df.columns[3], axis=1, inplace=True)
        df.to_csv(file, index=False)


createJson()
