import {TaskDefinition, TaskResponse} from "../index";
import * as fs from "fs";
let request = require("request");

export interface LoadTSVTaskDefinition extends TaskDefinition {
    url: string;
}

export default function (files: Array<string>, params: LoadTSVTaskDefinition): Promise<TaskResponse> {
    return new Promise((resolve, reject) => {
        let parts = params.url.split("/");
        let dest = params.path + parts[parts.length - 1];

        try {
            download(params.url, dest, (err) => {
                if (err) {
                    return reject(err.message);
                }

                resolve({
                    message: "Download destination: " + dest,
                    files: [dest]
                });
            });
        } catch (err) {
            reject(err);
        }

    });
}

function download(url: string, dest: string, callback: (err?: Error) => void) {
    request.get({url: url, encoding: "utf8"}, function (err: any, response: any, body: any) {
        fs.writeFile(dest, body, "utf8", function (err: Error) {
            if (err) {
                return callback(err);
            }

            callback();
        });
    });
}