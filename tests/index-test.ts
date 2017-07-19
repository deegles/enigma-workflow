import {expect} from "chai";
import * as os from "os";
import {TaskDefinition, TaskResponse} from "../src/index";
import {LoadTSVTaskDefinition} from "../src/tasks/LOADTSV";
import * as fs from "fs";
import * as assert from "assert";

let tasksPath = "../src/tasks";
let outputPathRoot = `${os.tmpdir()}/TEST_${Date.now()}/`;

// Need to create destination directory before running
fs.mkdirSync(outputPathRoot);

describe("LOADTSV", () => {
    it("can fetch TSV from a URL", () => {

        let taskDef: LoadTSVTaskDefinition = {
            name: "LOADTSV",
            desc: "LOADTSV test",
            path: outputPathRoot,
            url: "https://raw.githubusercontent.com/enigma-io/workflow-interview-challenge/master/inventory.tsv",
            parallel: false,
            retries: 0
        };

        let task = require(__dirname + "/" + tasksPath + "/" + taskDef.name).default as (files: Array<string>, taskDef: LoadTSVTaskDefinition) => Promise<TaskResponse>;

        return task([], taskDef).then(result => {
            expect(result.files[0]).equal(outputPathRoot + "inventory.tsv");
        }).catch(err => {
            console.log(err);
            expect(err).to.be.empty;
        });
    });
});

describe("TSVTOJSON", () => {
    it("can convert TSV to a JSON", (done) => {

        let taskDef: TaskDefinition = {
            name: "TSVTOJSON",
            desc: "TSVTOJSON test",
            path: outputPathRoot,
            parallel: false,
            retries: 0
        };

        let tsvPath = __dirname + "/tsv/inventory.tsv";
        let task = require(__dirname + "/" + tasksPath + "/" + taskDef.name).default as (files: Array<string>, taskDef: TaskDefinition) => Promise<TaskResponse>;

        task([tsvPath], taskDef).then(result => {
            let target = fs.readFileSync(outputPathRoot + "inventory.json").toString("utf8");
            let json = JSON.parse(target);

            expect(json).to.not.be.empty;

            let header = ["Rank", "Port", "Volume 2015", "Volume 2014", "Volume 2013", "Volume 2012", "Volume 2011"];

            assert.deepEqual(header, json["data"][0]);
            done();
        }).catch(err => {
            console.log(err);
            expect(err).to.be.empty;
            done();
        });
    });
});

describe("COUNTBYTES", () => {
    it("can count file bytes", (done) => {

        let taskDef: TaskDefinition = {
            name: "COUNTBYTES",
            desc: "COUNTBYTES test",
            path: outputPathRoot,
            parallel: false,
            retries: 0
        };

        let tsvPath = __dirname + "/tsv/inventory.tsv";
        let task = require(__dirname + "/" + tasksPath + "/" + taskDef.name).default as (files: Array<string>, taskDef: TaskDefinition) => Promise<TaskResponse>;

        task([tsvPath], taskDef).then(result => {
            let message = result.message.split("\n")[1];
            let bytes = message.split(":")[0].trim();

            expect(bytes).equal("2557");
            done();
        }).catch(err => {
            console.log(err);
            expect(err).to.be.empty;
            done();
        });
    });
});