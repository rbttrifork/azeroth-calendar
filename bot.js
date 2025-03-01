// Classic WoW Discord Bot
const { Client, GatewayIntentBits, EmbedBuilder, IntentsBitField } = require('discord.js');
const dotenv = require('dotenv');
const moment = require('moment');

// Load environment variables from .env file
dotenv.config();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// Define raid reset data
const raidResets = {
  ony: {
    name: "Onyxia's Lair",
    resetDays: 5, // 5-day reset (resets on Monday and Thursday)
    color: '#C41F3B', // Red
    thumbnail: 'https://i.imgur.com/pKFMK0O.png' // Onyxia icon
  },
  mc: {
    name: "Molten Core",
    resetDays: 7, // 7-day reset (resets weekly)
    color: '#FF8000', // Orange
    thumbnail: 'https://i.imgur.com/2kL7FQJ.png' // Molten Core icon
  },
  bwl: {
    name: "Blackwing Lair",
    resetDays: 7, // 7-day reset (resets weekly)
    color: '#A335EE', // Purple
    thumbnail: 'https://i.imgur.com/Ayd7MbB.png' // BWL icon
  },
  zg: {
    name: "Zul'Gurub",
    resetDays: 3, // 3-day reset
    color: '#1EFF00', // Green
    thumbnail: 'https://i.imgur.com/SAtpQUV.png' // ZG icon
  },
  aq20: {
    name: "Ruins of Ahn'Qiraj",
    resetDays: 3, // 3-day reset
    color: '#FFD100', // Yellow
    thumbnail: 'https://i.imgur.com/EwYXTfK.png' // AQ20 icon
  },
  aq40: {
    name: "Temple of Ahn'Qiraj",
    resetDays: 7, // 7-day reset
    color: '#FFD100', // Yellow
    thumbnail: 'https://i.imgur.com/PLZC3Vj.png' // AQ40 icon
  },
  naxx: {
    name: "Naxxramas",
    resetDays: 7, // 7-day reset
    color: '#0070DE', // Blue
    thumbnail: 'https://i.imgur.com/D1MGGMq.png' // Naxx icon
  }
};

// Darkmoon Faire schedule (example dates for 2025)
const darkmoonSchedule = [
  { start: '2025-01-05', end: '2025-01-11', location: 'Elwynn Forest / Mulgore' },
  { start: '2025-02-02', end: '2025-02-08', location: 'Elwynn Forest / Mulgore' },
  { start: '2025-03-02', end: '2025-03-08', location: 'Elwynn Forest / Mulgore' },
  { start: '2025-04-06', end: '2025-04-12', location: 'Elwynn Forest / Mulgore' },
  { start: '2025-05-04', end: '2025-05-10', location: 'Elwynn Forest / Mulgore' },
  { start: '2025-06-01', end: '2025-06-07', location: 'Elwynn Forest / Mulgore' },
  { start: '2025-07-06', end: '2025-07-12', location: 'Elwynn Forest / Mulgore' },
  { start: '2025-08-03', end: '2025-08-09', location: 'Elwynn Forest / Mulgore' },
  { start: '2025-09-07', end: '2025-09-13', location: 'Elwynn Forest / Mulgore' },
  { start: '2025-10-05', end: '2025-10-11', location: 'Elwynn Forest / Mulgore' },
  { start: '2025-11-02', end: '2025-11-08', location: 'Elwynn Forest / Mulgore' },
  { start: '2025-12-07', end: '2025-12-13', location: 'Elwynn Forest / Mulgore' },
];

// Function to calculate next reset date
function getNextResetDate(resetDays) {
  try {
    console.log(`Calculating reset date for ${resetDays}-day cycle`);
    const now = moment();
    let nextReset = moment();
    
    if (resetDays === 7) {
      // Weekly reset (Tuesday)
      nextReset.day(2); // Tuesday is day 2 (Sunday is 0)
      nextReset.hour(9).minute(0).second(0); // Reset at 9 AM server time
      
      if (nextReset.isBefore(now)) {
        nextReset.add(7, 'days');
      }
    } else if (resetDays === 5) {
      // Onyxia reset (Monday and Thursday)
      const dayOfWeek = now.day();
      if (dayOfWeek < 1) { // Sunday
        nextReset.day(1); // Monday
      } else if (dayOfWeek < 4) { // Monday, Tuesday, Wednesday
        nextReset.day(4); // Thursday
      } else { // Thursday, Friday, Saturday
        nextReset.day(8); // Next Monday
      }
      nextReset.hour(9).minute(0).second(0);
    } else if (resetDays === 3) {
      // 3-day reset (ZG, AQ20)
      const daysToAdd = 3 - (now.dayOfYear() % 3);
      if (daysToAdd === 0 && now.hour() >= 9) {
        nextReset.add(3, 'days');
      } else {
        nextReset.add(daysToAdd, 'days');
      }
      nextReset.hour(9).minute(0).second(0);
    }
    
    console.log(`Reset date calculated: ${nextReset.format()}`);
    return nextReset;
  } catch (error) {
    console.error('Error calculating reset date:', error);
    // Return a fallback date (next day at 9 AM)
    return moment().add(1, 'days').hour(9).minute(0).second(0);
  }
}

// Function to get the next Darkmoon Faire
function getNextDarkmoonFaire() {
  const now = moment();
  
  for (const faire of darkmoonSchedule) {
    const endDate = moment(faire.end);
    if (endDate.isAfter(now)) {
      return {
        start: moment(faire.start),
        end: endDate,
        location: faire.location
      };
    }
  }
  
  // If no faire is found in the current year, return the first one
  return {
    start: moment(darkmoonSchedule[0].start),
    end: moment(darkmoonSchedule[0].end),
    location: darkmoonSchedule[0].location
  };
}

// Event: When the client is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log('Bot is ready to receive commands!');
  
  // Initial activity set
  updateBotActivity();
  
  // Update the activity every 10 minutes
  setInterval(updateBotActivity, 10 * 60 * 1000);
});

// Event: Message handler
client.on('messageCreate', async message => {
  // Ignore messages from bots
  if (message.author.bot) return;
  
  // Check if the message starts with '!'
  if (!message.content.startsWith('!')) return;
  
  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  console.log(`Command received: ${command}`);
  
  // Command handler
  switch (command) {
    case 'help':
      sendHelpMessage(message);
      break;
    
    case 'ony':
    case 'mc':
    case 'bwl':
    case 'zg':
    case 'aq20':
    case 'aq40':
    case 'naxx':
      if (raidResets[command]) {
        console.log(`Processing raid command: ${command}`);
        sendRaidResetInfo(message, command);
      }
      break;
    
    case 'dmf':
    case 'darkmoon':
    case 'faire':
      sendDarkmoonInfo(message);
      break;
  }
});

// Function to send raid reset information
function sendRaidResetInfo(message, raidCommand) {
  try {
    console.log(`Generating reset info for ${raidCommand}`);
    const raid = raidResets[raidCommand];
    const nextReset = getNextResetDate(raid.resetDays);
    
    console.log(`Next reset date calculated: ${nextReset.format('YYYY-MM-DD HH:mm')}`);
    
    const embed = new EmbedBuilder()
      .setColor(raid.color)
      .setTitle(`${raid.name} Reset Timer`)
      .setThumbnail(raid.thumbnail)
      .addFields(
        { name: 'Next Reset', value: nextReset.format('dddd, MMMM Do YYYY, h:mm a') },
        { name: 'Time Until Reset', value: `${nextReset.fromNow()}` },
        { name: 'Reset Cycle', value: `${raid.resetDays} days` }
      )
      .setFooter({ text: 'Classic WoW Guild Bot' })
      .setTimestamp();
    
    console.log('Sending embed message...');
    message.channel.send({ embeds: [embed] })
      .then(() => console.log('Message sent successfully'))
      .catch(error => console.error('Error sending message:', error));
  } catch (error) {
    console.error('Error in sendRaidResetInfo:', error);
    // Send a plain text fallback message
    message.channel.send(`${raidResets[raidCommand].name} will reset ${getNextResetDate(raidResets[raidCommand].resetDays).fromNow()}.`);
  }
}

// Function to send Darkmoon Faire information
function sendDarkmoonInfo(message) {
  try {
    console.log('Generating Darkmoon Faire info');
    const nextFaire = getNextDarkmoonFaire();
    
    let status = 'Coming Soon';
    const now = moment();
    
    if (now.isBetween(nextFaire.start, nextFaire.end)) {
      status = 'Active Now!';
    }
    
    const embed = new EmbedBuilder()
      .setColor('#9013FE')
      .setTitle('Darkmoon Faire')
      .setThumbnail('https://i.imgur.com/lLKy4Ip.png')
      .addFields(
        { name: 'Status', value: status },
        { name: 'Location', value: nextFaire.location },
        { name: 'Start Date', value: nextFaire.start.format('dddd, MMMM Do YYYY') },
        { name: 'End Date', value: nextFaire.end.format('dddd, MMMM Do YYYY') }
      )
      .setFooter({ text: 'Classic WoW Guild Bot' })
      .setTimestamp();
    
    console.log('Sending Darkmoon Faire embed...');
    message.channel.send({ embeds: [embed] })
      .then(() => console.log('Darkmoon message sent successfully'))
      .catch(error => console.error('Error sending Darkmoon message:', error));
  } catch (error) {
    console.error('Error in sendDarkmoonInfo:', error);
    // Send a plain text fallback message
    const nextFaire = getNextDarkmoonFaire();
    message.channel.send(`The next Darkmoon Faire is ${nextFaire.start.fromNow()} in ${nextFaire.location}.`);
  }
}

// Function to send help message
function sendHelpMessage(message) {
  try {
    console.log('Generating help message');
    
    const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('Classic WoW Guild Bot Commands')
      .setDescription('Here are all the available commands:')
      .addFields(
        { name: '!ony', value: 'Get Onyxia\'s Lair reset information' },
        { name: '!mc', value: 'Get Molten Core reset information' },
        { name: '!bwl', value: 'Get Blackwing Lair reset information' },
        { name: '!zg', value: 'Get Zul\'Gurub reset information' },
        { name: '!aq20', value: 'Get Ruins of Ahn\'Qiraj reset information' },
        { name: '!aq40', value: 'Get Temple of Ahn\'Qiraj reset information' },
        { name: '!naxx', value: 'Get Naxxramas reset information' },
        { name: '!dmf', value: 'Get Darkmoon Faire information' },
        { name: '!help', value: 'Show this help message' }
      )
      .setFooter({ text: 'Classic WoW Guild Bot' });
    
    console.log('Sending help embed...');
    message.channel.send({ embeds: [embed] })
      .then(() => console.log('Help message sent successfully'))
      .catch(error => console.error('Error sending help message:', error));
  } catch (error) {
    console.error('Error in sendHelpMessage:', error);
    // Send a plain text fallback message
    message.channel.send('Available commands: !ony, !mc, !bwl, !zg, !aq20, !aq40, !naxx, !dmf, !help');
  }
}

// Function to update bot activity with next raid reset
function updateBotActivity() {
  try {
    // Get the next upcoming reset (compare all raids and find the soonest one)
    let nextReset = null;
    let nextRaidName = '';
    
    for (const [raidKey, raid] of Object.entries(raidResets)) {
      const resetDate = getNextResetDate(raid.resetDays);
      
      if (!nextReset || resetDate.isBefore(nextReset)) {
        nextReset = resetDate;
        nextRaidName = raid.name;
      }
    }
    
    if (nextReset) {
      // Format days and hours
      const now = moment();
      const diffHours = nextReset.diff(now, 'hours');
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      
      let statusText = '';
      if (days > 0) {
        statusText = `${nextRaidName}: ${days}d ${hours}h`;
      } else {
        statusText = `${nextRaidName}: ${hours}h`;
      }
      
      // Check if we're within 24 hours of a Darkmoon Faire
      const nextFaire = getNextDarkmoonFaire();
      const untilFaire = nextFaire.start.diff(now, 'hours');
      
      // If Darkmoon Faire is closer than the next raid reset, show that instead
      if (untilFaire > 0 && untilFaire < diffHours) {
        const faireDays = Math.floor(untilFaire / 24);
        const faireHours = untilFaire % 24;
        
        if (faireDays > 0) {
          statusText = `DMF: ${faireDays}d ${faireHours}h`;
        } else {
          statusText = `DMF: ${faireHours}h`;
        }
      } else if (now.isBetween(nextFaire.start, nextFaire.end)) {
        // If Darkmoon Faire is active now
        statusText = `DMF: Active now!`;
      }
      
      // Set activity
      console.log(`Updating bot activity to: ${statusText}`);
      client.user.setActivity(statusText, { type: 'WATCHING' });
    } else {
      // Fallback activity
      client.user.setActivity('Classic WoW', { type: 'PLAYING' });
    }
  } catch (error) {
    console.error('Error updating activity:', error);
    // Fallback activity
    client.user.setActivity('Classic WoW', { type: 'PLAYING' });
  }
}

// Login to Discord with your token
client.login(process.env.DISCORD_TOKEN);