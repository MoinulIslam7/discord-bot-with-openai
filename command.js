require('dotenv').config();
const { REST, Routes } = require('discord.js');

// demo commands 
const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong! pong!',
    },
];
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// register command
try {
    console.log('Started refreshing application (/) commands.');
    rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}