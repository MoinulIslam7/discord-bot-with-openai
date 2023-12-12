require('dotenv').config();
const { Client, Events, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const fs = require('node:fs');
const path = require('node:path');

// register a client for messaging
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
})

// default reply 
client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    message.reply("Hi " + message?.author?.username + " Bro!!");
});

// Commands 
const commands = [];
client.commands = new Collection();
const folderPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(folderPath);
// console.log(commandFolders) // output : ['ping', 'user']
const commandFiles = commandFolders.filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON())
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}
// }

// command reply  
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
    // await interaction.reply('Pong!');
});


// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();

// client.once(Events.ClientReady, readyClient => {
//     console.log(`Ready! Logged in as ${readyClient.user.tag}`);
// });

client.login(process.env.TOKEN);