// import { testTextContains, testTextNotContained, testClassContains, testElementLocatedByXpath, testElementNotLocatedByXPath, testElementLocatedById, clickElementById, clickElementByXPath, getTextByXPath } from './webdriverAccess'
const { Builder, WebDriver, promise, logging } = require("selenium-webdriver");
const {
  testElementLocatedById,
  testElementLocatedByXpath,
  testTextContains,
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
    this.benchmarkInfo = benchmarkInfo;
  }

  init(driver) {}
  run(driver) {}
  after(driver) {}

  // Good fit for a single result creating Benchmark
  resultKinds() {
    return [this.benchmarkInfo];
  }
  extractResult(results, resultKind) {
    return results;
  }
};

const Benchmark_AddTodos = new class extends Benchmark {
  constructor() {
    super({
      id: "01_addTodos",
      label: "create todos",
      description: "creating 1,00 todos",
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
      "html/body/section/section/ul/li[99]"
    );
  }
}();

const Benchmark_DeleteTodos = new class extends Benchmark {
  constructor() {
    super({
      id: "02_deleteTodos",
      label: "delete todos",
      description: "deleting 1,00 todos",
      type: BenchmarkType.CPU
    });
  }
  async init(driver) {
    await testElementLocatedById(driver, "benchmark-add-todos", SHORT_TIMEOUT);
    await testElementLocatedById(
      driver,
      "benchmark-delete-todos",
      SHORT_TIMEOUT
    );
    await clickElementById(driver, "benchmark-add-todos");
    await testElementLocatedByXpath(
      driver,
      "html/body/section/section/ul/li[99]"
    );
  }
  async run(driver) {
    await clickElementById(driver, "benchmark-delete-todos");
    await testTextContains(
      driver,
      "html/body/section/section/ul/li/div/label",
      "Task-99"
    );
  }
}();

const Benchmark_ReorderTodos = new class extends Benchmark {
  constructor() {
    super({
      id: "03_reorderTodos",
      label: "reorder todos",
      description: "reordering 1,00 todos",
      type: BenchmarkType.CPU
    });
  }
  async init(driver) {
    await testElementLocatedById(driver, "benchmark-add-todos", SHORT_TIMEOUT);
    await testElementLocatedById(
      driver,
      "benchmark-reorder-todos",
      SHORT_TIMEOUT
    );
    await clickElementById(driver, "benchmark-add-todos");
    await testElementLocatedByXpath(
      driver,
      "html/body/section/section/ul/li[99]"
    );
  }
  async run(driver) {
    await clickElementById(driver, "benchmark-reorder-todos");
    await testTextContains(
      driver,
      "html/body/section/section/ul/li/div/label",
      "Task-1"
    );
  }
}();

const BENCHMARK_TYPES = {
  Benchmark_AddTodos: "Benchmark_AddTodos",
  Benchmark_DeleteTodos: "Benchmark_DeleteTodos",
  Benchmark_ReorderTodos: "Benchmark_ReorderTodos"
};

const benchmarks = {
  Benchmark_AddTodos: Benchmark_AddTodos,
  Benchmark_DeleteTodos: Benchmark_DeleteTodos,
  Benchmark_ReorderTodos: Benchmark_ReorderTodos
};

module.exports = {
  Benchmark,
  BenchmarkType,
  BENCHMARK_TYPES,
  benchmarks
};
