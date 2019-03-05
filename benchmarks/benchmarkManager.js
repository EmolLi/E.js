const { BenchmarkType, Benchmark, BENCHMARK_TYPES } = require("./benchmark");
const fs = require("fs");
// const yargs = require("yargs");
const config = require("./config");
const R = require("ramda");
const { fork } = require("child_process");

let benchmarkOption = {
  outputDirectory: "./result/",
  port: config.PORT.toFixed(),
  // headless: args.headless,
  // chromeBinaryPath: args.chromeBinary,
  numIterationsForAllBenchmarks: config.REPEAT_RUN,
  numIterationsForStartupBenchmark: config.REPEAT_RUN_STARTUP
};

function forkedRun(benchmark, benchmarkOption) {
  return new Promise(function(resolve, reject) {
    const forked = fork("./benchmarkRunner.js");
    if (config.LOG_DEBUG) console.log("forked child process");
    forked.send({ benchmark, benchmarkOption });
    forked.on("message", msg => {
      if (config.LOG_DEBUG)
        console.log("main process got message from child", msg);
      resolve(msg);
    });
  });
}

forkedRun(BENCHMARK_TYPES.Benchmark_AddTodos, benchmarkOption);
