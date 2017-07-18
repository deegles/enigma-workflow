Enigma Workflow Challenge

Define your workflow as a TOML file. See workflows/enigma.toml

Tasks are defined in order of execution. Any task-specific data should be included here. Task names must have a corresponding file under the `tasks` directory. The output of each task will be fed into the subsequent task.

Each task must implement the following behavior

1. Export a single function
2. Receive as input an array of strings representing fully qualified file names and an object containing any task specific parameters.
3. Perfom any operations on the input files without modifying them.
4. Output an object containing an array of strings representing fully qualified file names for the next task and a string property MESSAGE. This will be printed after each task.

