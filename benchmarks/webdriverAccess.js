const chrome = require("selenium-webdriver/chrome");
const chalk = require("chalk");
const {
  By,
  until,
  Builder,
  WebDriver,
  Locator,
  promise,
  WebElement,
  Condition
} = require("selenium-webdriver");
const config = require("./config");

function testElementLocatedById(driver, id, timeout = config.TIMEOUT) {
  return waitForCondition(driver)(
    `testElementLocatedById ${id}`,
    async function(driver) {
      try {
        let elem = await driver.findElement(By.tagName("body"));
        elem = await elem.findElement(By.id(id));
        return true;
      } catch (err) {
        // console.log("ignoring error in testElementLocatedById for id = "+id,err.toString().split("\n")[0]);
      }
    },
    timeout
  );
}

function testElementLocatedByXpath(driver, xpath, timeout = config.TIMEOUT) {
  return waitForCondition(driver)(
    `testElementLocatedByXpath ${xpath}`,
    async function(driver) {
      try {
        await driver.findElement(By.tagName("body"));
        let elem = await driver.findElement(By.xpath(xpath));
        return elem ? true : false;
      } catch (err) {
        // console.log(
        //   "ignoring error in testElementLocatedByXpath for xpath = " + xpath,
        //   err.toString()
        // );
      }
    },
    timeout
  );
}

function clickElementById(driver, id) {
  return retry(5, driver, async function(driver) {
    let elem = await driver.findElement(By.tagName("body"));
    elem = await elem.findElement(By.id(id));
    await elem.click();
  });
}

function waitForCondition(driver) {
  return async function(text, fn, timeout) {
    return await driver.wait(new Condition(text, fn), timeout);
  };
}

async function retry(retryCount, driver, fun) {
  for (let i = 0; i < retryCount; i++) {
    try {
      return fun(driver, i);
    } catch (err) {
      console.log("retry failed");
    }
  }
}

module.exports = {
  testElementLocatedById,
  testElementLocatedByXpath,
  clickElementById,
  waitForCondition
};
