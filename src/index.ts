import * as toml from "toml";
import * as fs from "fs";
import * as os from "os";
import concat = require("concat-stream");
let workflowsPath = "../workflows";
let tasksPath = "./tasks";
let outputPathRoot = `${os.tmpdir()}/RUN_${Date.now()}/`;
let logPath = outputPathRoot + "log.txt";

// Need to create destination directory before running
fs.mkdirSync(outputPathRoot);

/**
 * Main workflow runner. First task receives an empty list of files.
 */
async function main() {

    // Get all workflows
    let workflows = fs.readdirSync(__dirname + "/" + workflowsPath).map(file => {
        return file.slice(0, file.length - 5);
    });

    let taskNames = fs.readdirSync(__dirname + "/" + tasksPath).map(file => {
        return file.slice(0, file.length - 3);
    });

    // Get the target workflow name
    let workflowName = process.argv[2];

    // Load the workflow or display error
    if (workflowName && workflows.indexOf(workflowName) > -1) {
        console.log(`-------------\nExecuting workflow: ${workflowName}`);
        console.log(`Log path:  ${logPath}\n-------------`);

        try {
            let workflow = await getWorkflow(workflowName);

            let tasksInter = workflow.tasks.map(task => {
                if (taskNames.indexOf(task.name) > -1) {
                    return {staged: stageTask(task), parallel: task.parallel};
                } else {
                    throw `${task.name} not found.`;
                }
            });

            /**
             * Some tasks can be run concurrently, group them together to be executed with Promise.All later
             */
            let canConcat = false;
            let tasks: Array<Array<(files: Array<string>) => Promise<TaskResponse>>> = [];
            tasksInter.forEach(task => {
                if (!task.parallel) {
                    tasks.push([task.staged]);
                    canConcat = false;
                } else if (canConcat) {
                    let t = tasks.pop();
                    tasks.push(t.concat(task.staged));
                    canConcat = true;
                } else {
                    tasks.push([task.staged]);
                    canConcat = true;
                }
            });

            runTask(tasks, []);
        } catch (err) {
            console.log("Error staging tasks: " + err);
        }

    } else {
        console.log(`Could not find workflow${workflowName ? ": " + workflowName : ", none defined." }`);
    }
}

/**
 * Runs each task or set of parallel tasks. Stops the workflow on any failure.
 * @param taskList
 * @param files
 */
function runTask(taskList: Array<Array<(files: Array<string>) => Promise<TaskResponse>>>, files: Array<string>) {
    let currentTask = taskList[0];

    if (currentTask.length > 1) {
        console.log(`\n-------\nRunning ${currentTask.length} tasks in parallel!\n-------`);
    }

    Promise.all(currentTask.map(p => {
        return p(files);
    })).then(results => {

        results.forEach(result => {
            console.log(result.message);
            fs.appendFileSync(logPath, result.message + "\n");
        });

        if (taskList.length > 1) {
            runTask(taskList.slice(1), results[0].files); // WARNING: each set of parallel tasks should return the same list of files for the next step
        } else {
            console.log(`\n-------\nWorkflow complete!\nGenerated files located at: ${outputPathRoot}\n-------\n`);
        }
    }).catch(err => {
        console.log("Error executing task: " + err);
    });
}

/**
 * Fetch each task and convert to a promise.
 * @param task task definition
 */
function stageTask(taskDef: TaskDefinition): (files: Array<string>) => Promise<TaskResponse> {
    return (files: Array<string>) => {
        taskDef.path = outputPathRoot;
        return new Promise((resolve, reject) => {
            let message = `\nRunning task ${taskDef.name}...`;
            console.log(message);
            fs.appendFileSync(logPath, message + "\n");

            let task = require(__dirname + "/" + tasksPath + "/" + taskDef.name).default as TaskResponseFactory;

            try {
                resolve(task(files, taskDef));
            } catch (err) {
                reject(err);
            }
        });
    };
}

/**
 * Fetch the workflow description from disk and parse it into a JSON file
 * @param name Name of the workflow
 * @returns {Promise<Workflow>} An object representing the workflow
 */
function getWorkflow(name: string): Promise<Workflow> {
    return new Promise((resolve, reject) => {
        fs.createReadStream(`${__dirname}/${workflowsPath}/${name}.toml`).pipe(concat(function (data: any) {
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
    path: string;
    parallel: boolean;
    retries: number;
}

export interface Workflow {
    title: string;
    tasks: Array<TaskDefinition>;
}

export interface TaskResponse {
    message: string;
    files: Array<string>;
}

export interface TaskResponseFactory {
    (files: Array<string>, taskDef: TaskDefinition): Promise<TaskResponse>;
}