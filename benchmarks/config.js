module.exports = {
  PORT: 8080,
  REPEAT_RUN: 2,
  REPEAT_RUN_STARTUP: 4,
  DROP_WORST_RUN: 0,
  WARMUP_COUNT: 5,
  TIMEOUT: 60 * 1000,
  LOG_PROGRESS: true,
  LOG_DETAILS: false,
  LOG_DEBUG: false,
  LOG_TIMELINE: false,
  EXIT_ON_ERROR: false,
  STARTUP_DURATION_FROM_EVENTLOG: true,
  STARTUP_SLEEP_DURATION: 1000,
  FORK_CHROMEDRIVER: true,
  TEST_URL: "http://127.0.0.1:8887/example/todoappForBenchmark/todo.html"
};
