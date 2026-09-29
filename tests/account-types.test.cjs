const demoPassword=require('node:crypto').randomBytes(24).toString('base64url');
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const ctx={crypto:webcrypto,TextEncoder,Uint8Array};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script id="account-core">([\s\S]*?)<\/script>/)[1],ctx);
(async()=>{
 assert.equal(typeof ctx.createDemoAccountType,'function','Custom account type creation must exist');
 let accounts=[{id:'owner',email:'owner@example.com',role:'admin',active:true}],types=[],actor='owner';
 const store={read:()=>structuredClone(accounts),save:a=>accounts=structuredClone(a),actor:()=>actor,types:()=>ctx.demoAccountTypes(types),saveTypes:t=>types=structuredClone(t)};
 const planner=ctx.createDemoAccountType({name:' Inventory Planner ',role:'member'},store);
 assert.equal(planner.name,'Inventory Planner');assert.equal(planner.role,'member');
 assert.throws(()=>ctx.createDemoAccountType({name:'inventory planner',role:'admin'},store),/already exists/);
 assert.throws(()=>ctx.createDemoAccountType({name:'Admin',role:'member'},store),/already exists/);
 for(const input of [{name:' ',role:'member'},{name:'a'.repeat(41),role:'member'},{name:'Bad',role:'owner'}])assert.throws(()=>ctx.createDemoAccountType(input,store));
 const input={name:'Planner',email:'planner@example.com',password:demoPassword,confirm:demoPassword,role:planner.id};
 const user=await ctx.createAdminDemoAccount(input,store);assert.equal(user.role,'member');assert.equal(user.accountType,planner.id);
 const manager=ctx.createDemoAccountType({name:'Warehouse Manager',role:'admin'},store);
 const admin=await ctx.createAdminDemoAccount({...input,email:'manager@example.com',role:manager.id},store);assert.equal(admin.role,'admin');assert.equal(admin.accountType,manager.id);
 actor=user.id;assert.throws(()=>ctx.createDemoAccountType({name:'Forbidden',role:'admin'},store),/administrator/);
 console.log('Custom types: names, duplicate/reserved labels, permissions and assigned-user access pass.');
})().catch(e=>{console.error(e);process.exitCode=1});
