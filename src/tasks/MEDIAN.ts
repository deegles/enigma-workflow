import {TaskDefinition, TaskResponse} from "../index";
import * as fs from "fs";

export interface MedianTaskDefinition extends TaskDefinition {
    out: string;
    column: number;
}

export default function (files: Array<string>, params: MedianTaskDefinition): TaskResponse {
    let message = "";
    let dest = params.path + params.out;
    files.forEach(file => {
        let json = JSON.parse(fs.readFileSync(file).toString("utf8"));
        let columnData: Array<string> = json["data"].slice(1).map((row: Array<string>) => {
            return row[params.column];
        });

        let result = getMedian(columnData.map(datum => {
            return parseFloat(datum);
        }));

        fs.appendFileSync(dest, JSON.stringify({median: result}) + "\n");
        message += "MEDIAN: " + result;
    });

    return {
        message: message,
        files: [dest]
    };
}

function getMedian(data: Array<number>): number {
    let values = data.sort();

    return (values[(values.length - 1) >> 1] + values[values.length >> 1]) / 2;
}