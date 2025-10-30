const { test, expect } = require("@playwright/test");
const { create } = require("domain");
const { beforeEach } = require("node:test")
import dayjs from 'dayjs';

class accounts {

  constructor() {
    this.id;
    this.type = "";
  }
}

var username, password,amount,balence;
var Accounts = [];

const random = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const fetchNumbers = (text) =>{

  var Num = ""
  for(var i = 0; i < text.length; i++){

    if(text[i] >= "0" && text[i] <="9"){
      Num += text[i]
    }

    if(text[i] == "."){
      Num+=text[i]
    }

  }
  return Num
}

const createAccount = (accId, accType) => {

  var account = new accounts()
  account.id = accId
  account.type = accType
  Accounts.push(account)

}

test.describe('Banking App Auth Module' , async () => {

    test.beforeEach('Going to the site', async ({page}) => {
        
        await page.goto("https://parabank.parasoft.com/parabank/index.htm")
    })

    test('Account Creation Page' , async ({page}) => {

        await page.locator("//a[normalize-space()='Register']").click()
        await page.locator("//*[@id='customer.firstName']").fill("Hamza")
        await page.locator("//*[@id='customer.lastName']").fill(random())
        await page.locator("//*[@id='customer.address.street']").fill(random())
        await page.locator("//*[@id='customer.address.city']").fill(random())
        await page.locator("//*[@id='customer.address.state']").fill(random())
        await page.locator("//*[@id='customer.address.zipCode']").fill("46125")
        await page.locator("//*[@id='customer.phoneNumber']").fill("75473456346")
        await page.locator("//input[@id='customer.ssn']").fill("55256")

        username = random();
        password = random();

        await page.locator("//*[@id='customer.username']").fill(username)
        await page.locator("//*[@id='customer.password']").fill(password)
        await page.locator("//*[@id='repeatedPassword']").fill(password)

        await page.locator("//*[@id='customerForm']/table/tbody/tr[13]/td[2]/input").click()
        await page.locator("//*[@id='leftPanel']/ul/li[8]/a").click()
        
    })
})

test.describe('Exploring UserDashboard', async () => {

   test.beforeEach('Login', async ({page}) => {

        await page.goto("https://parabank.parasoft.com/parabank/index.htm")
        await page.locator("//*[@id='loginPanel']/form/div[1]/input").fill(username)
        await page.locator("//*[@id='loginPanel']/form/div[2]/input").fill(password)
        await page.locator("//*[@id='loginPanel']/form/div[3]/input").click()
    })

    test('Opening Account', async ({page}) => {

      await page.locator("//*[@id='leftPanel']/ul/li[1]/a").click()

      createAccount(await page.locator("//*[@id='fromAccountId']").selectOption({ index: 0 }),"Checking")

      const selectedText = await page.locator("//select[@id='type']").evaluate(el => el.options[el.selectedIndex].text)

      await page.locator("//*[@id='openAccountForm']/form/div/input").click()
      await page.waitForTimeout(3000)

      var idText = await page.locator("//*[@id='newAccountId']").textContent()

      createAccount(idText,selectedText)

    })

    test('Transfering Funds between Accounts', async ({page}) => {

      amount = "20";
      await page.locator("//*[@id='leftPanel']/ul/li[3]/a").click()
      await page.locator("//*[@id='toAccountId']").selectOption({ value: Accounts[1].id });
     
      await page.locator("//*[@id='amount']").fill(amount)
      await page.locator("//*[@id='transferForm']/div[2]/input").click()

      await page.waitForTimeout(2000)

      expect(await page.locator("//*[@id='amountResult']").innerText()).toEqual("$"+amount+".00")
     
      var actualText = fetchNumbers(Accounts[0].id)
      expect(await page.locator("//*[@id='fromAccountIdResult']").innerText()).toEqual(actualText);

      actualText = fetchNumbers(Accounts[1].id)
      expect(await page.locator("//*[@id='toAccountIdResult']").innerText()).toEqual(actualText);

      await page.locator("//*[@id='leftPanel']/ul/li[2]/a").click()

      var Money = "$"+String(Number(amount) + 100)+".00";
      await expect(await page.locator("//*[@id='accountTable']/tbody/tr[2]/td[2]").textContent()).toEqual(Money)

      Money = "$"+String(415 - Number(amount))+".50";
      await expect(await page.locator("//*[@id='accountTable']/tbody/tr[1]/td[2]").textContent()).toEqual(Money)
      balence = String(415 - Number(amount))+".50";

    })

    test('Bill Payment', async ({page}) => {

      await page.locator("//*[@id='leftPanel']/ul/li[4]/a").click()

      for(var i = 1; i<=4; i++){

      await page.locator(`//*[@id='billpayForm']/form/table/tbody/tr[${i}]/td[2]/input`).fill(random())

      }

      await page.locator("//*[@id='billpayForm']/form/table/tbody/tr[5]/td[2]/input").fill('3643634')
      await page.locator("//*[@id='billpayForm']/form/table/tbody/tr[6]/td[2]/input").fill('453643634')

      var actualText = fetchNumbers(Accounts[1].id)
      await page.locator("//*[@id='billpayForm']/form/table/tbody/tr[8]/td[2]/input").fill(actualText)
      await page.locator("//*[@id='billpayForm']/form/table/tbody/tr[9]/td[2]/input").fill(actualText)
  
      amount = "30"
      await page.locator("//input[@name='amount']").fill(amount)
      await page.locator("//*[@id='billpayForm']/form/table/tbody/tr[14]/td[2]/input").click()
      await expect(await page.locator("//*[@id='billpayResult']/p[1]")).toBeVisible()

    })

    test('Request Loan', async ({page}) => {
      amount = "30"
      
      await page.locator("//*[@id='leftPanel']/ul/li[7]/a").click()
      await page.waitForTimeout(2000)
      await page.locator("//*[@id='amount']").fill(amount)
      await page.locator("//*[@id='downPayment']").fill("15")
      await page.locator("//*[@id='leftPanel']/ul/li[2]/a").click()

      expect(await page.locator("//*[@id='accountTable']/tbody/tr[1]/td[2]").textContent()).toBe("$"+ String(balence - Number(amount))+"0")

    })

    test('View Todays Transection', async ({page}) => {

      const formatted = dayjs().format('MM-DD-YYYY');
      await page.locator("//*[@id='leftPanel']/ul/li[5]/a").click()
      await page.locator("//*[@id='transactionDate']").fill(formatted)
      await page.locator("//*[@id='findByDate']").click()

      await page.waitForTimeout(2000)
      var tbRows =  await page.$$("//*[@id='transactionBody']/tr")

      await expect(tbRows.length).toEqual(2)

    })   

})

test.describe('Clean Database' , async ()=> {

  test('Vanish DB', async ({page}) => {

      await page.goto("https://parabank.parasoft.com/parabank/index.htm")
      await page.locator("//*[@id='headerPanel']/ul[1]/li[6]/a").click()
      await page.locator("//button[normalize-space()='Initialize']").click()
      await page.locator("//*[@id='rightPanel']/table/tbody/tr/td[1]/form/table/tbody/tr/td[2]/button").click()
      var message = await page.locator("//*[@id='rightPanel']/p/b")
      await expect(message).toBeVisible()
    })

 })