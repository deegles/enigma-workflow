import {TaskDefinition, TaskResponse} from "../index";
import * as fs from "fs";

export default function (files: Array<string>, params: TaskDefinition): Promise<TaskResponse> {

    return new Promise((resolve, reject) => {
        let results: Array<string> = [];
        try {
            files.forEach(file => {
                let raw = fs.readFileSync(file).toString("utf8");
                let dest = file.slice(0, file.length - 4) + ".json";

                raw.split("\n").forEach(line => {
                    if (line.length > 0) {
                        fs.appendFileSync(dest, JSON.stringify(line.split("\t")) + "\n");
                    }
                });

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