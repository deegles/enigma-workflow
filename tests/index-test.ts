import {expect} from "chai";
import * as os from "os";
import {TaskDefinition, TaskResponse} from "../src/index";
import {LoadTSVTaskDefinition} from "../src/tasks/LOADTSV";
import * as fs from "fs";

let tasksPath = "../src/tasks";
let outputPathRoot = `${os.tmpdir()}/RUN_${Date.now()}/`;

// Need to create destination directory before running
fs.mkdirSync(outputPathRoot);

describe("LOADTSV", () => {
    it("can fetch TSV from a URL", (done) => {

        let taskDef: LoadTSVTaskDefinition = {
            name: "LOADTSV",
            desc: "LOADTSV test",
            path: outputPathRoot,
            url: "https://raw.githubusercontent.com/enigma-io/workflow-interview-challenge/master/inventory.tsv"
        };

        let task = require(__dirname + "/" + tasksPath + "/" + taskDef.name).default as (files: Array<string>, taskDef: LoadTSVTaskDefinition) => Promise<TaskResponse>;

        task([], taskDef).then(result => {
            expect(result.files[0]).equal(outputPathRoot + "inventory.tsv");
            done();
        }).catch(err => {
            console.log(err);
            expect(err).to.be.empty;
        });
    });
});