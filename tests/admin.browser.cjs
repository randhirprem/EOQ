const demoPassword=require('node:crypto').randomBytes(24).toString('base64url');
const {chromium}=require('playwright'),fs=require('fs'),http=require('http'),assert=require('node:assert/strict');
(async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(fs.readFileSync(require('path').join(__dirname,'../index.html')));}).listen(8877,'127.0.0.1');
 let browser;
 try{
 browser=await chromium.launch({headless:true,...(process.env.CHROME_BIN?{executablePath:process.env.CHROME_BIN}:{})});
 const page=await browser.newPage({viewport:{width:1400,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8877');await page.locator('#show-signup').click();
 for(const [id,value] of Object.entries({'account-name':'Admin Tester','account-email':'owner@example.com','account-password':demoPassword,'account-confirm':demoPassword}))await page.locator('#'+id).fill(value);
 for(const id of ['account-name','account-email','account-password','account-confirm','new-user-name','new-user-email','new-user-password','new-user-confirm','account-search']) assert.equal(await page.locator('#'+id).getAttribute('type'),'password',id+' must be masked');
 await page.locator('#auth-submit').click();await page.locator('#tab-admin').click();
 assert(!/Admin Tester|owner@example.com/.test(await page.locator('body').innerText()),'Account identity must not be rendered');
 const owner=await page.evaluate(()=>sessionStorage.getItem('stockwise.demo.session.v1'));
 async function add(email,role){
  for(const [id,value] of Object.entries({'new-user-name':'Added User','new-user-email':email,'new-user-password':demoPassword,'new-user-confirm':demoPassword}))await page.locator('#'+id).fill(value);
  await page.locator('#new-user-role').selectOption(role);await page.locator('#admin-add-submit').click();
 }
 await page.locator('#new-type-name').fill('Inventory Planner');await page.locator('#admin-add-type button').click();await page.locator('#admin-type-success').waitFor({state:'visible'});
 const planner=await page.locator('#new-user-role').inputValue();assert.match(planner,/^type-/);
 await page.locator('#new-type-name').fill('inventory planner');await page.locator('#admin-add-type button').click();await page.locator('#admin-type-error').waitFor({state:'visible'});assert.match(await page.locator('#admin-type-error').textContent(),/already exists/);
 await page.locator('#new-type-name').fill('Warehouse Manager');await page.locator('#new-type-access').selectOption('admin');await page.locator('#admin-add-type button').click();await page.locator('#admin-type-success').waitFor({state:'visible'});
 const manager=await page.locator('#new-user-role').inputValue();
 await add('member@example.com',planner);await page.locator('#admin-add-success').waitFor({state:'visible'});
 assert(!/Added User|member@example.com/.test(await page.locator('body').innerText()),'Created account must remain masked');
 const labels=await page.locator('[aria-label]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')).join(' '));
 assert(!/member@example.com|owner@example.com/.test(labels),'Accessible labels must remain masked');
 assert.equal(await page.locator('#admin-total').textContent(),'2');assert.equal(await page.evaluate(()=>sessionStorage.getItem('stockwise.demo.session.v1')),owner);
 assert.equal(await page.locator('#new-user-password').inputValue(),'');
 await add('MEMBER@example.com','member');await page.locator('#admin-add-error').waitFor({state:'visible'});assert.match(await page.locator('#admin-add-error').textContent(),/already exists/);
 await add('admin@example.com',manager);await page.locator('#admin-add-success').waitFor({state:'visible'});assert.equal(await page.locator('#admin-total').textContent(),'3');
 await page.getByLabel('Role for Account 2',{exact:true}).selectOption(manager);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('stockwise.demo.accounts.v1')).find(a=>a.email==='member@example.com').role),'admin');
 await page.getByLabel('Role for Account 2',{exact:true}).selectOption(planner);
 await page.reload();await page.locator('#tab-admin').click();assert.equal(await page.getByLabel('Role for Account 2',{exact:true}).inputValue(),planner);
 assert.match(await page.locator('#account-types-list').textContent(),/Warehouse Manager/);
 await page.screenshot({path:'/tmp/stockwise-admin-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'/tmp/stockwise-admin-mobile.png',fullPage:true});
 await page.locator('#sign-out').click();
 await page.locator('#account-email').fill('member@example.com');await page.locator('#account-password').fill(demoPassword);await page.locator('#auth-submit').click();await page.locator('#app-main').waitFor({state:'visible'});assert(!(await page.locator('#tab-admin').isVisible()));
 await page.locator('#sign-out').click();await page.locator('#account-email').fill('admin@example.com');await page.locator('#account-password').fill(demoPassword);await page.locator('#auth-submit').click();await page.locator('#tab-admin').click();assert.equal(await page.locator('#admin-total').textContent(),'3');
 assert.deepEqual(errors,[]);console.log('Browser: custom types, duplicate rejection, assignment changes, persistence, role-based sign-in and mobile layout pass.');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1});
