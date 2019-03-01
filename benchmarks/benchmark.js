// import { testTextContains, testTextNotContained, testClassContains, testElementLocatedByXpath, testElementNotLocatedByXPath, testElementLocatedById, clickElementById, clickElementByXPath, getTextByXPath } from './webdriverAccess'
const { Builder, WebDriver, promise, logging } = require("selenium-webdriver");
const {
  testElementLocatedById,
  testElementLocatedByXpath,
  clickElementById,
  waitForCondition
} = require("./webdriverAccess");

const BenchmarkType = {
  CPU: "CPU",
  MEM: "MEM",
  STARTUP: "STARTUP"
};

const SHORT_TIMEOUT = 20 * 1000;

/*
export interface BenchmarkInfo {
    id: string;
    type: BenchmarkType;
    label: string;
    description: string;
    throttleCPU?: number
}
*/
const Benchmark = class Benchmark {
  // id: string;
  // type: BenchmarkType;
  // label: string;
  // description: string;
  // throttleCPU?: number;

  constructor(benchmarkInfo) {
    this.id = benchmarkInfo.id;
    this.type = benchmarkInfo.type;
    this.label = benchmarkInfo.label;
    this.description = benchmarkInfo.description;
    this.throttleCPU = benchmarkInfo.throttleCPU;
  }

  init(driver) {}
  run(driver) {}
  after(driver) {}

  // Good fit for a single result creating Benchmark
  // resultKinds(): Array<BenchmarkInfo> { return [this.benchmarkInfo]; }
  // extractResult(results: any[], resultKind: BenchmarkInfo): number[] { return results; };
};

const Benchmark_AddTodos = new class extends Benchmark {
  constructor() {
    super({
      id: "01_addTodos",
      label: "create todos",
      description: "creating 1,000 todos",
      type: BenchmarkType.CPU
    });
  }
  async init(driver) {
    await testElementLocatedById(driver, "benchmark-add-todos", SHORT_TIMEOUT);
  }
  async run(driver) {
    await clickElementById(driver, "benchmark-add-todos");
    await testElementLocatedByXpath(
      driver,
      "html/body/section/section/ul/li[100]"
    );
  }
}();

const BENCHMARK_TYPES = {
  Benchmark_AddTodos: "Benchmark_AddTodos"
};

const benchmarks = {
  Benchmark_AddTodos: Benchmark_AddTodos
};

module.exports = {
  Benchmark,
  BenchmarkType,
  BENCHMARK_TYPES,
  benchmarks
};
