import {TaskDefinition, TaskResponse} from "../index";

export interface CurrentTaskDefinition extends TaskDefinition {
    url: string;
}

export default function (files: Array<string>, params: CurrentTaskDefinition): TaskResponse {

    files.forEach(file => {
        console.log("file: " + file);
    });
    console.log("destination: " + params.path);
    return {
        message: `Loaded file: ${params.url}`,
        files: ["fakefile"]
    };
}