const { Builder, By, Key, until, logging } = require("selenium-webdriver");
const { benchmarks } = require("./benchmark");
const chrome = require("selenium-webdriver/chrome");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const config = require("./config");
const R = require("ramda");

const testUrl = "http://127.0.0.1:8887/example/todoappForBenchmark/todo.html";

async function buildDriver() {
  let logPref = new logging.Preferences();
  logPref.setLevel(logging.Type.PERFORMANCE, logging.Level.ALL);
  logPref.setLevel(logging.Type.BROWSER, logging.Level.ALL);

  let options = new chrome.Options();
  // if(benchmarkOptions.headless) {
  // options = options.addArguments("--disable-gpu"); // https://bugs.chromium.org/p/chromium/issues/detail?id=737678
  // options = options.addArguments("--headless");
  // }
  options = options.addArguments("--js-flags=--expose-gc");
  options = options.addArguments("--no-sandbox");
  options = options.addArguments("--no-first-run");
  options = options.addArguments("--enable-automation");
  options = options.addArguments("--disable-infobars");
  options = options.addArguments("--disable-background-networking");
  options = options.addArguments("--disable-background-timer-throttling");
  options = options.addArguments("--disable-cache");
  options = options.addArguments("--disable-translate");
  options = options.addArguments("--disable-sync");
  options = options.addArguments("--disable-extensions");
  options = options.addArguments("--disable-default-apps");
  options = options.addArguments("--window-size=1200,800");
  // if (benchmarkOptions.chromeBinaryPath) options = options.setChromeBinaryPath(benchmarkOptions.chromeBinaryPath);
  options = options.setLoggingPrefs(logPref);

  options = options.setPerfLoggingPrefs({
    enableNetwork: true,
    enablePage: true,
    traceCategories: lighthouse.traceCategories.join(", ")
  });

  // let service = new chrome.ServiceBuilder(args.chromeDriver).build();
  // return chrome.Driver.createSession(options, service);
  driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
  return driver;
}

// interface Timingresult {
//   type: string;
//   ts: number;
//   dur?: number;
//   end?: number;
//   mem?: number;
//   evt?: any;
// }

function extractRelevantEvents(entries) {
  let filteredEvents = [];
  let protocolEvents = [];
  entries.forEach(x => {
    let e = JSON.parse(x.message).message;
    if (config.LOG_DETAILS) console.log(JSON.stringify(e));
    if (e.method === "Tracing.dataCollected") {
      protocolEvents.push(e);
    }
    if (
      e.method &&
      (e.method.startsWith("Page") || e.method.startsWith("Network"))
    ) {
      protocolEvents.push(e);
      if (e.params.args.data.type === "click") {
      } else if (e.params.name === "EventDispatch") {
        if (config.LOG_TIMELINE) console.log("CLICK ", JSON.stringify(e));
        filteredEvents.push({
          type: "click",
          ts: +e.params.ts,
          dur: +e.params.dur,
          end: +e.params.ts + e.params.dur
        });
      }
    } else if (
      e.params.name === "TimeStamp" &&
      (e.params.args.data.message === "afterBenchmark" ||
        e.params.args.data.message === "finishedBenchmark" ||
        e.params.args.data.message === "runBenchmark" ||
        e.params.args.data.message === "initBenchmark")
    ) {
      filteredEvents.push({
        type: e.params.args.data.message,
        ts: +e.params.ts,
        dur: 0,
        end: +e.params.ts
      });
      if (config.LOG_TIMELINE) console.log("TIMESTAMP ", JSON.stringify(e));
    } else if (e.params.name === "navigationStart") {
      filteredEvents.push({
        type: "navigationStart",
        ts: +e.params.ts,
        dur: 0,
        end: +e.params.ts
      });
      if (config.LOG_TIMELINE)
        console.log("NAVIGATION START ", JSON.stringify(e));
    } else if (e.params.name === "Paint") {
      if (config.LOG_TIMELINE) console.log("PAINT ", JSON.stringify(e));
      filteredEvents.push({
        type: "paint",
        ts: +e.params.ts,
        dur: +e.params.dur,
        end: +e.params.ts + e.params.dur,
        evt: JSON.stringify(e)
      });
    } else if (e.params.name === "MajorGC" && e.params.args.usedHeapSizeAfter) {
      filteredEvents.push({
        type: "gc",
        ts: +e.params.ts,
        end: +e.params.ts,
        mem: Number(e.params.args.usedHeapSizeAfter) / 1024 / 1024
      });
      if (config.LOG_TIMELINE) console.log("GC ", JSON.stringify(e));
    }
  });
  return { filteredEvents, protocolEvents };
}

async function fetchEventsFromPerformanceLog(driver) {
  let timingResults = [];
  let protocolResults = [];
  let entries = [];
  do {
    entries = await driver
      .manage()
      .logs()
      .get(logging.Type.PERFORMANCE);
    const { filteredEvents, protocolEvents } = extractRelevantEvents(entries);
    timingResults = timingResults.concat(filteredEvents);
    protocolResults = protocolResults.concat(protocolEvents);
  } while (entries.length > 0);
  return { timingResults, protocolResults };
}
async function runCPUBenchmark(benchmark, benchmarkOption) {
  let errors = [];
  let warnings = [];

  console.log("benchmarking ", benchmark.id);
  let driver = await buildDriver(benchmarkOption);
  try {
    for (let i = 0; i < benchmarkOption.numIterationsForAllBenchmarks; i++) {
      try {
        await driver.get(testUrl);

        // await (driver as any).sendDevToolsCommand('Network.enable');
        // await (driver as any).sendDevToolsCommand('Network.emulateNetworkConditions', {
        //     offline: false,
        //     latency: 200, // ms
        //     downloadThroughput: 780 * 1024 / 8, // 780 kb/s
        //     uploadThroughput: 330 * 1024 / 8, // 330 kb/s
        // });
        await driver.executeScript("console.timeStamp('initBenchmark')");
        await initBenchmark(driver, benchmark);
        if (benchmark.throttleCPU) {
          console.log("CPU slowdown", benchmark.throttleCPU);
          await driver.sendDevToolsCommand("Emulation.setCPUThrottlingRate", {
            rate: benchmark.throttleCPU
          });
        }
        await driver.executeScript("console.timeStamp('runBenchmark')");
        await runBenchmark(driver, benchmark);
        if (benchmark.throttleCPU) {
          console.log("resetting CPU slowdown");
          await driver.sendDevToolsCommand("Emulation.setCPUThrottlingRate", {
            rate: 1
          });
        }
        await driver.executeScript("console.timeStamp('finishedBenchmark')");
        await afterBenchmark(driver, benchmark);
        await driver.executeScript("console.timeStamp('afterBenchmark')");
      } catch (e) {
        errors.push(await registerError(driver, benchmark, e));
        throw e;
      }
    }
    // console.log()
    /*
    let results = await computeResultsCPU(
      driver,
      benchmarkOptions,
      benchmark,
      warnings
    );
    await writeResult(
      { results: results, benchmark: benchmark },
      benchmarkOptions.outputDirectory
    );*/
    console.log("QUIT");
    await driver.close();
    await driver.quit();
  } catch (e) {
    console.log("ERROR:", e);
    await driver.close();
    await driver.quit();
    if (config.EXIT_ON_ERROR) {
      throw "Benchmarking failed";
    }
  }
  return { errors, warnings };
}

function type_eq(requiredType) {
  return e => e.type === requiredType;
}
function type_neq(requiredType) {
  return e => e.type !== requiredType;
}

function asString(res) {
  return res.reduce((old, cur) => old + "\n" + JSON.stringify(cur), "");
}

async function runBenchmark(driver, benchmark) {
  await benchmark.run(driver);
  if (config.LOG_PROGRESS)
    console.log("after run ", benchmark.id, benchmark.type);
}

async function afterBenchmark(driver, benchmark) {
  if (benchmark.after) {
    await benchmark.after(driver);
    if (config.LOG_PROGRESS)
      console.log("after benchmark ", benchmark.id, benchmark.type);
  }
}

async function initBenchmark(driver, benchmark) {
  await benchmark.init(driver);
  if (config.LOG_PROGRESS)
    console.log("after initialized ", benchmark.id, benchmark.type);
}

async function executeBenchmark(benchmark, benchmarkOption) {
  let errorsAndWarnings;
  // if (benchmark.type == BenchmarkType.STARTUP) {
  //   errorsAndWarnings = await runStartupBenchmark(
  //     benchmark,
  //     benchmarkOptions
  //   );
  // } else {
  errorsAndWarnings = await runCPUBenchmark(benchmark, benchmarkOption);
  // }

  return errorsAndWarnings;
}

async function registerError(driver, benchmark, error) {
  let fileName = "error-" + benchmark.id + ".png";
  console.error("Benchmark failed", error);
  let image = await driver.takeScreenshot();
  console.error(`Writing screenshot ${fileName}`);
  fs.writeFileSync(fileName, image, { encoding: "base64" });
  return { imageFile: fileName, exception: error };
}

process.on("message", msg => {
  if (config.LOG_DEBUG) console.log("child process got message", msg);

  let { benchmark, benchmarkOption } = msg;
  console.log(benchmark, benchmark.todo);
  benchmark = benchmarks[benchmark];
  if (!benchmarkOption.port) benchmarkOption.port = config.PORT.toFixed();

  try {
    let errorsPromise = executeBenchmark(benchmark, benchmarkOption);
    errorsPromise
      .then(errorsAndWarnings => {
        if (config.LOG_DEBUG)
          console.log(
            "benchmark finished - got errors promise",
            errorsAndWarnings
          );
        process.send(errorsAndWarnings);
        process.exit(0);
      })
      .catch(err => {
        console.log("error running benchmark", err);
        process.exit(1);
      });
  } catch (err) {
    console.log("error running benchmark", err);
    process.exit(1);
  }
});

module.exports = { executeBenchmark };
