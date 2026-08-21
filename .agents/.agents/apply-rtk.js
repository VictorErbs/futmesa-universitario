const fs=require("fs");
const p=JSON.parse(fs.readFileSync(0,"utf8"));
let cmd=p.toolCall.args.CommandLine;
const rtkCommands = ["npm", "git", "gh", "npx", "node"];
const firstWord = cmd.trim().split(" ")[0];
if(rtkCommands.includes(firstWord) && !cmd.startsWith("rtk ")){
  cmd="rtk "+cmd;
}
console.log(JSON.stringify({decision:"allow",overwrite:{CommandLine:cmd}}));
