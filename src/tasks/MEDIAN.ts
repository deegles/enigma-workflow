import {TaskResponse} from "../index";

export default function (files: Array<string>, params: any): TaskResponse {

    files.forEach(file => {
        console.log("file: " + file);
    });
    return {
        message: `Done.`,
        files: ["fakefile"]
    };
}