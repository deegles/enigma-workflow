import {TaskResponse} from "../index";

export default function (files: Array<string>, params: any): TaskResponse {
    console.log("destination: " + params.path);

    files.forEach(file => {
        console.log("file: " + file);
    });
    return {
        message: `Loaded file: ${params["url"]}`,
        files: ["fakefile"]
    };
}