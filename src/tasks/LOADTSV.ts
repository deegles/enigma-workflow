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
            download(params.url, dest, params.retries || 0, (err) => {
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

function download(url: string, dest: string, retries: number, callback: (err?: Error) => void) {

    if (retries < 0) {
        callback(new Error("Unable to fetch resource at " + url));
    } else {
        request.get({url: url, encoding: "utf8"}, function (err: any, response: any, body: any) {
            if (err || response.statusCode !== 200) {
                console.log(response.body);
                download(url, dest, retries - 1, callback);
            } else {
                fs.writeFile(dest, body, "utf8", function (err: Error) {
                    callback();
                });
            }
        });
    }
}