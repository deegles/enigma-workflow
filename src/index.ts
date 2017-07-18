import * as toml from "toml";
import * as fs from "fs";
import concat = require("concat-stream");
let workflowsPath = "../workflows";
let tasksPath = "./tasks";

/**
 * Main workflow runner
 */
function main() {

    // Get all workflows
    let workflows = fs.readdirSync(__dirname + "/" + workflowsPath).map(file => {
        return file.slice(0, file.length - 5);
    });

    let taskNames = fs.readdirSync(__dirname + "/" + tasksPath).map(file => {
        return file.slice(0, file.length - 3);
    });

    // Get the workflow name
    let workflowName = process.argv[2];

    // Load the workflow or display error
    if (workflowName && workflows.indexOf(workflowName) > -1) {
        console.log(`Executing workflow: ${workflowName}`);

        getWorkflow(workflowName).then(workflow => {
            try {
                let tasks = workflow.tasks.map(task => {
                    if (taskNames.indexOf(task.name) > -1) {
                        return stageTask(task);
                    } else {
                        throw `${task.name} not found.`;
                    }
                });

                runTask(tasks, []);
            } catch (err) {
                console.log("Error staging tasks: " + err);
            }

        }).catch(err => {
            console.log("Error parsing workflow: " + err);
        });

    } else {
        console.log(`Could not find workflow${workflowName ? ": " + workflowName : ", none defined." }`);
    }
}

/**
 *
 * @param taskList
 * @param files
 */
function runTask(taskList: Array<(files: Array<string>) => Promise<TaskResponse>>, files: Array<string>) {
    let currentTask = taskList[0];

    currentTask(files).then(result => {
        console.log(result.message);
        if (taskList.length > 1) {
            runTask(taskList.slice(1), result.files);
        } else {
            console.log("Workflow complete!");
        }
    }).catch(err => {
        console.log("Error executing task: " + err);
    });
}

/**
 * Fetch each task and convert to a promise
 * @param task task definition
 */
function stageTask(taskDef: TaskDefinition): (files: Array<string>) => Promise<TaskResponse> {
    return (files: Array<string>) => {
        return new Promise((resolve, reject) => {
            console.log(`Running task ${taskDef.name}...`);
            let task = require(__dirname + "/" + tasksPath + "/" + taskDef.name).default as (files: Array<string>, taskDef: TaskDefinition) => TaskResponse;

            try {
                resolve(task(files, taskDef));
            } catch (err) {
                reject(err);
            }
        });
    };
}

let t = require("./tasks/LOADTSV");

/**
 * Fetch the workflow description from disk and parse it into a JSON file
 * @param name Name of the workflow
 * @returns {Promise<Workflow>} An object representing the workflow
 */
function getWorkflow(name: string): Promise<Workflow> {
    return new Promise((resolve, reject) => {
        fs.createReadStream(`${__dirname}/${workflowsPath}/${name}.toml`, "utf8").pipe(concat(function (data: any) {
            try {
                let parsed = toml.parse(data);
                resolve(parsed);
            } catch (e) {
                reject(e);
            }
        }));
    });
}

main();


/********
 * Interface definitons
 */

export interface TaskDefinition {
    name: string;
    desc: string;
}

export interface Workflow {
    title: string;
    tasks: Array<TaskDefinition>;
}

export interface TaskResponse {
    message: string;
    files: Array<string>;
}