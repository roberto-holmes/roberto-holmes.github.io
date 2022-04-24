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
                    output_object["date"] = file[len(input_dir) : len(input_dir) + 8]
                    output_object["game"] = row[3]
                    output_object["series"] = row[4]
                elif i == 1:
                    output_object["fastest_lap"] = []
                    for element in row:
                        if element != "":
                            output_object["fastest_lap"].append(element)

                else:
                    drivers.append({"name": row[1], "pos": row[0]})

            output_object["drivers"] = drivers

            # Write all the data to JSON files with the same name as the CSVs
            with open(output_dir + file[file.find("\\") : -4] + ".json", "w") as output:
                output.write(json.dumps(output_object))

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
