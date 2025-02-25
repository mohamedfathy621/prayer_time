// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const axios = require('axios');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
const cairoHours = new Date().toLocaleTimeString("en-US", {timeZone: "Africa/Cairo",hour12: false, }).split(':');
const cairodays = new Date().toLocaleDateString("en-US", {timeZone: "Africa/Cairo"})
const pchours = new Date().toLocaleTimeString("en-US",{hour12:false}).split(':');
const pcdays = new Date().toLocaleDateString()


async function get_prayer_time(){
	const response= await axios.get("https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5&date=21-02-2025")
	return response
}
/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
let skip='same'
for(let i=0;i<3;i++){
    if(parseInt(cairodays.split('/')[i])>parseInt(pcdays.split('/')[i])){
        skip='cairo'
        break
    } 
    else if(parseInt(cairodays.split('/')[i])<parseInt(pcdays.split('/')[i])){
        skip='pc'
        break
    } 
}

let hour=skip=='cairo'?parseInt(pchours[0])-(parseInt(cairoHours[0])+24):skip=='pc'?(parseInt(pchours[0])+24)-parseInt(cairoHours[0]):parseInt(pchours[0])-parseInt(cairoHours[0])
let final={}
let loading=false

get_prayer_time().then((ans)=>{
	final=ans.data.data.timings
	let arr=[]
	for(const key in final){
		let praytime=final[key].split(':')
		let prayhour=parseInt(praytime[0])+hour<0?(parseInt(praytime[0])+hour)+24:parseInt(praytime[0])+hour
		arr.push(`${key} ${prayhour==12?'12':`${prayhour%12}`}:${parseInt(praytime[1])} ${prayhour>=12?'pm':'am'}`)
	}
	vscode.window.showInformationMessage(arr.join('||'))
	vscode.window.showInformationMessage("prayer extension is ready")
	loading=true
})	
	
	function get_nearest_prayer(){
		if(loading){
		console.log('i was c')
		const current_pc_hour = new Date().toLocaleTimeString("en-US",{hour12:false}).split(':');
			for(const key in final){
				let praytime=final[key].split(':')
				let prayhour=parseInt(praytime[0])+hour<0?(parseInt(praytime[0])+hour)+24:parseInt(praytime[0])+hour
				let timediffrence=((prayhour-parseInt(current_pc_hour[0]))*60)+(parseInt(praytime[1])-parseInt(current_pc_hour[1]))
				if(timediffrence>0&&timediffrence<10){
					vscode.window.showInformationMessage(`${key} prayer is in ${timediffrence} mins`)
				}
			}
		}			
	}
	function get_next_prayer(){
		let min=1500
		let prayer=""
		let time=""
		const current_pc_hour = new Date().toLocaleTimeString("en-US",{hour12:false}).split(':');	
		if(loading){
		for(const key in final){
			let praytime=final[key].split(':')
			let prayhour=parseInt(praytime[0])+hour<0?(parseInt(praytime[0])+hour)+24:parseInt(praytime[0])+hour
			let timediffrence=((prayhour-parseInt(current_pc_hour[0]))*60)+(parseInt(praytime[1])-parseInt(current_pc_hour[1]))
			if(timediffrence>0&&timediffrence<min){
				min=timediffrence
				prayer=key
				time = `${prayhour==12?'12':`${prayhour%12}`}:${parseInt(praytime[1])} ${prayhour>=12?'pm':'am'}`
			}
		}
		vscode.window.showInformationMessage(`nearest prayer is ${prayer} at ${time}`)
	}
	}
	setInterval(get_nearest_prayer,3000)
	setInterval(get_next_prayer,300000)
	const disposable = vscode.commands.registerCommand('prayer-time.prayertime', function () {
		let arr=[]
		if(loading){
			for(const key in final){
				let praytime=final[key].split(':')
				let prayhour=parseInt(praytime[0])+hour<0?(parseInt(praytime[0])+hour)+24:parseInt(praytime[0])+hour
				arr.push(`${key} ${prayhour==12?'12':`${prayhour%12}`}:${parseInt(praytime[1])} ${prayhour>=12?'pm':'am'}`)
			}
			
			vscode.window.showInformationMessage(arr.join('||'))
	
		//console.log("Current Time Zone:", cairoOffset);
		}
		
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
