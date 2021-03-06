const fs = require(`fs`);
const Discord = require(`discord.js`);
const mysql = require(`mysql`);

/**
 * Grabs the command prefix and tokens from config.json
 * Determines whether RokettoBot is deployed via online apps or locally. 
 * Don't pay this too much attention if you're not the author. 
 */

if(process.env.PREFIX != undefined){
	var prefix = process.env.PREFIX, botToken = process.env.BOT_TOKEN, giphyKey = process.env.GIPHY_KEY;
}else{
	var {prefix, botToken, giphyKey} = require(`./config.json`);
}

// Logs in RokettoBot.
const bot = new Discord.Client();								
bot.login(botToken);

/* Sets up a connection to MySQL database.
var dbase = mysql.createConnection({
	host: "localhost",
	user: "u427550163_rkbot",
	password: "",
	database: "u427550163_rkbot"
});*/

/* Actually (tries to) connect to my database.
dbase.connect(err => {
	if(err){
		console.log(`Error! Couldn't connect to the database: ${err}`);
		throw err;
	}
	console.log(`Connected to the database!`);
});*/

// Interfaces with Giphy's API.
var giphyAPIClient = require(`giphy-js-sdk-core`);
giphy = giphyAPIClient(giphyKey);

// Loops through the bot_commands file and adds each command to the bot.
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync(`./bot_commands`).filter(file => file.endsWith(`.js`));
for (const file of commandFiles) {
	const command = require(`./bot_commands/${file}`);
	bot.commands.set(command.name, command);
}

// Initializes some variables. To be explained further below.
var args, cmd, mentions, query, queryString, atUser, user, toUser, botResponse, logResponse;

// Logs this message to the console when RokettoBot boots up.
bot.once(`ready`, () => {
	bot.user.setActivity(`by my own rules...`);
	console.log(`Now witness the firepower of this fully armed and operational Discord Bot!`); 
})

// Runs this block whenever RokettoBot sees a new message.
bot.on(`message`, message => {

	// Exits immediately if the message doesn't start with the command prefix.
	if(!message.content.startsWith(prefix)) return; 

		/**
		 * Turns message content into Nightbot variables. For more info,
		 * go to https://docs.nightbot.tv/commands/variables
		 * Args (array) - Equivalent to $(1), $(2), $(3), etc.
		 * However, unlike Nightbot's argument variables, the message can contain 
		 * as many arguments as the user inputs. 
		 * Cmd (string) - The command name being run, without the prefix.
	 	 * Mentions (array) - Array of user mentions in the message.
	 	 * Query (string) - Equivalent to $(query)
	 	 * QueryString (string) - Equivalent to $(querystring)
	 	 * AtUser (string) - Equivalent to $(user), this will tag the user.
	 	 * User (string) - Equivalent to $(user), this will NOT tag the user.
		 * ToUser (string) - Equivalent to $(touser)
		 */

		args = message.content.split(/ +/); 
		cmd = args[0].slice(prefix.length).toLowerCase(); 
		args.shift();
		mentions = message.mentions.members.array(); 
		query = args.join(` `); 
		queryString = encodeURIComponent(query); 
		atUser = message.member; 
		user = atUser.displayName; 
		toUser = args[0]?args[0]:user; 

		// Logs the user's message to the console.
		console.log(`${user}: ${message.content}`); 

		// Exits if the command being run doesn't exist.
		if(!bot.commands.has(cmd)) return;
		
		// This section is what actually runs the command.
		try{
			// Sends arguments to the command being run.
			bot.commands.get(cmd).execute(message, user, atUser, toUser, query, queryString, args, mentions); 

			// Logs RokettoBot's response.
			console.log(`RokettoBot: ${logResponse}`); 
		}catch(error){
			console.error(error);
			message.reply(`Sorry ${atUser}, this command is currently FUBAR'ed.`);
		}
})
