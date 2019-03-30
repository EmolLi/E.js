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

// driver.findElement(By.xpath("//tbody/tr[1]/td[1]")).getText().then(...) can throw a stale element error:
// thus we're using a safer way here:
async function testTextContains(driver, xpath, text, timeout = config.TIMEOUT) {
  return waitForCondition(driver)(
    `testTextContains ${xpath} ${text}`,
    async function(driver) {
      try {
        await driver.findElement(By.tagName("body"));
        elem = await driver.findElement(By.xpath(xpath));
        if (elem == null) return false;
        let v = await elem.getText();
        return v && v.indexOf(text) > -1;
      } catch (err) {
        // console.log(
        //   "ignoring error in testTextContains for xpath = " +
        //     xpath +
        //     " text = " +
        //     text,
        //   err.toString().split("\n")[0]
        // );
      }
    },
    timeout
  );
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
  testTextContains,
  clickElementById,
  waitForCondition
};
