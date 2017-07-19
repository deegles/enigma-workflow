import {TaskDefinition, TaskResponse} from "../index";
import * as fs from "fs";

export default function (files: Array<string>, params: TaskDefinition): Promise<TaskResponse> {
    return new Promise((resolve, reject) => {
        let results: Array<string> = [];
        try {
            files.forEach(file => {
                let stats = fs.statSync(file);
                results.push(`${stats.size}:${file}`);
            });

            resolve({
                message: `\tbytes:filename\n\t${results.join("\n\t")}`,
                files: files
            });

        } catch (err) {
            reject(err);
        }
    });
}