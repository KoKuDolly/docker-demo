// const path = require("path");
// const fs = require("fs");
// const YAML = require("yaml");

// fs.readFile(
//   path.join(__dirname, "docker-compose.dev.yml"),
//   "utf8",
//   (err, data) => {
//     const yaml = YAML.parse(data);
//     console.log(data, yaml, JSON.stringify(yaml));
//   }
// );
import { readFile, writeFile } from "fs/promises";
import path from "path";
import YAML from "yaml";

// const promise = readFile(path.join("docker-compose.dev.yml"), "utf-8");
const promise = readFile(path.join("./.github/workflows/main.yml"), "utf-8");

promise.then((res) => {
  const yaml = YAML.parse(res);
  writeFile(path.join("parseyml.json"), JSON.stringify(yaml), "utf-8");
});
