# Enigma Workflow Challenge
My solution to https://github.com/enigma-io/workflow-interview-challenge

### Overview

Each workflow is defined as a TOML file. See workflows/enigma.toml

Tasks are defined in order of execution. Any task-specific parameters should be included here. Task names must have a corresponding file under the `tasks` directory. The output of each task will be fed into the subsequent task.

A new directory is created for each run in order to avoid conflicts.

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

Output will be similar to the below:

```
Diegos-MacBook-Pro:enigma-workflow deegles$ npm run workflow enigma

> enigma@1.0.0 workflow /private/tmp/enigma-workflow
> npm run clean && npm run build && node build/src/index.js "enigma"


> enigma@1.0.0 clean /private/tmp/enigma-workflow
> rm -rf ./build


> enigma@1.0.0 build /private/tmp/enigma-workflow
> tslint -c tslint.json 'src/**/*.ts' && tsc -p . && cp -r workflows build/

-------------
Executing workflow: enigma
Log path:  /var/folders/s6/hwy4f75d0y3544cz51_1vj980000gn/T/RUN_1500495077328/log.txt
-------------

Running task LOADTSV...
Download destination: /var/folders/s6/hwy4f75d0y3544cz51_1vj980000gn/T/RUN_1500495077328/inventory.tsv

Running task TSVTOJSON...
Processed file count: 1

Running task COUNTBYTES...
	bytes:filename
	3383:/var/folders/s6/hwy4f75d0y3544cz51_1vj980000gn/T/RUN_1500495077328/inventory.json

-------
Running 3 tasks in parallel!
-------

Running task MIN...

Running task MAX...

Running task MEDIAN...
MIN: 2.9
MAX: 35.29
MEDIAN: 18.775

Running task COUNTBYTES...
	bytes:filename
	44:/var/folders/s6/hwy4f75d0y3544cz51_1vj980000gn/T/RUN_1500495077328/stats.json

-------
Workflow complete!
-------
```