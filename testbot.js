// Minimal test bot
const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create client with all possible intents to ensure message detection
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// Log when ready
client.on('ready', () => {
  console.log(`Test bot logged in as ${client.user.tag}`);
  console.log('Monitoring for any messages...');
});

// Log every single message received
client.on('messageCreate', (message) => {
  console.log('------------------------------');
  console.log(`Message detected from ${message.author.username}: ${message.content}`);
  
  // Reply to any message that starts with '!'
  if (message.content.startsWith('!')) {
    console.log('Command detected, attempting to reply...');
    message.channel.send(`I received your command: ${message.content}`)
      .then(() => console.log('Reply sent successfully'))
      .catch(error => console.error('Error sending reply:', error));
  }
});

// Log all errors
client.on('error', error => {
  console.error('Discord client error:', error);
});

// Login
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('Login successful'))
  .catch(error => console.error('Login failed:', error));