# Enigma Workflow Challenge
My solution to https://github.com/enigma-io/workflow-interview-challenge

### Overview

Each workflow is defined as a TOML file. See workflows/enigma.toml

Tasks are defined in order of execution. Any task-specific parameters should be included here. Task names must have a corresponding file under the `tasks` directory. The output of each task will be fed into the subsequent task.

Each task implements the following behavior

1. Export a single default function that returns a Promise<TaskDefinition>
2. Receive as input an array of strings representing fully qualified file names and an object containing task specific parameters. All tasks should write to the root of the PATH parameter.
3. Perfom any operations on the input files without modifying them.
4. Implement any retry logic internally according to the `retries` parameter if present.
5. Output an object containing an array of strings named `files` (representing fully qualified file names for the next task) and a string property MESSAGE. This will be printed after each task.

### Running the sample

`git clone https://github.com/deegles/enigma-workflow`

`cd enigma-workflow`

`npm install`

`npm run test`

`npm run workflow enigma`