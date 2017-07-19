import {TaskDefinition, TaskResponse} from "../index";
import * as fs from "fs";

export default function (files: Array<string>, params: TaskDefinition): Promise<TaskResponse> {
    return new Promise((resolve, reject) => {
        let results: Array<string> = [];
        try {
            files.forEach(file => {
                let raw = fs.readFileSync(file).toString("utf8");
                let pathSplit = file.split("/");
                let fileName = pathSplit[pathSplit.length - 1];
                let dest = params.path + fileName.slice(0, fileName.length - 4) + ".json";

                let lines: Array<Array<string>> = [];
                raw.split("\n").forEach(line => {
                    if (line.length > 0) {
                        lines.push(line.split("\t"));
                    }
                });

                fs.writeFileSync(dest, JSON.stringify({data: lines}));

                results.push(dest);
            });

            resolve({
                message: `Processed file count: ${results.length}`,
                files: results
            });

        } catch (err) {
            reject(err);
        }
    });
}