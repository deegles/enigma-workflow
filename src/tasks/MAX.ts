import {TaskDefinition, TaskResponse} from "../index";
import * as fs from "fs";

export interface MaxTaskDefinition extends TaskDefinition {
    out: string;
    column: number;
}

export default function (files: Array<string>, params: MaxTaskDefinition): TaskResponse {
    let message = "";
    let dest = params.path + params.out;

    files.forEach(file => {
        let json = JSON.parse(fs.readFileSync(file).toString("utf8"));
        let columnData: Array<string> = json["data"].slice(1).map((row: Array<string>) => {
            return row[params.column];
        });

        let result = getMax(columnData.map(datum => {
            return parseFloat(datum);
        }));

        fs.appendFileSync(dest, JSON.stringify({max: result}) + "\n");
        message += "MAX: " + result;
    });

    return {
        message: message,
        files: [dest]
    };
}

function getMax(data: Array<number>): number {
    return Math.max.apply({}, data);
}