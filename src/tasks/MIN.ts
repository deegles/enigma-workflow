import {TaskDefinition, TaskResponse} from "../index";
import * as fs from "fs";

export interface MinTaskDefinition extends TaskDefinition {
    out: string;
    column: number;
}

export default function (files: Array<string>, params: MinTaskDefinition): Promise<TaskResponse> {
    return new Promise((resolve, reject) => {
        try {
            let message = "";
            let dest = params.path + params.out;

            files.forEach(file => {
                let json = JSON.parse(fs.readFileSync(file).toString("utf8"));
                let columnData: Array<string> = json["data"].slice(1).map((row: Array<string>) => {
                    return row[params.column];
                });

                let result = getMin(columnData.map(datum => {
                    return parseFloat(datum);
                }));

                fs.appendFileSync(dest, JSON.stringify({min: result}) + "\n");
                message += "MIN: " + result;
            });

            resolve({
                message: message,
                files: [dest]
            });
        } catch (err) {
            reject(err);
        }
    });
}

function getMin(data: Array<number>): number {
    return Math.min.apply({}, data);
}