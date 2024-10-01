
const { ApplicationCommandOptionType, EmbedBuilder, ButtonStyle, ButtonBuilder, ButtonInteraction, ButtonComponent, ActionRowBuilder, ComponentType, ChannelType, ThreadAutoArchiveDuration } = require("discord.js");
const { config } = require("dotenv");
const color = require("@root/config").EMBED_COLORS.BOT_EMBED
const { getUser } = require("@schemas/User");
const { channel } = require("diagnostics_channel");

const SHIFTS = require("../../../config").SHIFTS;
function extractNumber(str) {
  // Use regular expression to match all numbers in the string
  const matches = str.match(/\d+/g);

  // Convert the matched strings to numbers
  const numbers = matches ? matches.map(Number) : [];

  return numbers;
}
function extractNumbersFrom(str) {
  // Use a regular expression to match all occurrences of numbers in the string
  const matches = str.match(/\d+/g);
  
  // If no matches are found, return an empty array
  if (!matches) {
      return [];
  }
  
  // Convert matches to numbers and return
  const i = matches.map(Number)
  return i[0];
}
function getJobDetails(niceJobName) {
  
  const jobMap = {
    "Ben's Ice Cream": "benIceCream",
    "BFF Market": "bffMarket",
    "Blox Burger": "bloxBurger",
    "The Fishing Hut": "fishing",
    "Mike's Motors": "mechanic",
    "Bloxburg Mines": "bloxburgMines",
    "Pizza Planet Kitchen": "pizzaBaking",
    "Pizza Planet Delivery": "pizzaDelivery",
    "Stylez Salon": "stylezSalon",
    "Green Clean": "janitor",
    "Lovely Lumber": "woodCutter"
  };
  

  const jobKey = Object.keys(jobMap).find(key => niceJobName.includes(key));
  
  if (jobKey && SHIFTS[jobMap[jobKey]]) {
    return {
      Emoji: SHIFTS[jobMap[jobKey]].Emoji,
      Role: SHIFTS[jobMap[jobKey]].ROLE_ID
    };
  } else {
    return {
      Emoji: "",
      Role: ""
    };
  }
}
function timeAgo(dateString) {
  const givenDate = new Date(dateString);
  const now = new Date();
  const diffInMs = now - givenDate;

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
}

// Function to extract numbers from the input and assign to variables
function extractNumbers(input) {
  const inputString = input.toString();
  const parts = inputString.split('_');
  
  if (parts.length !== 4) {
      throw new Error("Input does not have the correct format");
  }

  const guildid = parts[0];
  const channelid = parts[1];
  const messageid = parts[2];
  const userid = parts[3];
  return { guildid, channelid, messageid, userid };
}

function extractAndFormatNumbers(inputString) {
  // Regular expression to match numbers between <@ and >
  let regex = /<@(\d+)>/g;
  let matches;
  let result = "";

  // Iterate over all matches
  while ((matches = regex.exec(inputString)) !== null) {
      // Append the matched number enclosed in <@ and > to the result string
      result += `<@${matches[1]}>\n`;
  }

  // Remove the trailing newline character if it exists
  if (result.endsWith("\n")) {
      result = result.slice(0, -1);
  }

  return result;
}

function extractEmoji(input) {
  const inputString = input.toString();
  const parts = inputString.split(' ');
  
  const emoji = parts[0];
  const part1 = parts[1]
  const part2 = parts[2] 
  const part3 = parts[3] || null

  if(part3 !== null) return `${part1} ${part2} ${part3}`
  else{
    return `${part1} ${part2}`
  }
}

function extractText(input) {
  const inputString = input.toString();
  const parts = inputString.split(' ');
  
  const emoji = parts[0];
 

  return `${emoji}`
}

const jobOptions = [
  { name: `${SHIFTS.benIceCream.Emoji} Ben's Ice Cream`, value: "benIceCream" },
  { name: `${SHIFTS.bffMarket.Emoji} BFF Market`, value: "bffMarket" },
  { name: `${SHIFTS.bloxBurger.Emoji} Blox Burger`, value: "bloxBurger" },
  { name: `${SHIFTS.fishing.Emoji} Fishing Hut`, value: "fishing" },
  { name: `${SHIFTS.mechanic.Emoji} Mike's Motors`, value: "mechanic" },
  { name: `${SHIFTS.bloxburgMines.Emoji} Bloxburg Mines`, value: "bloxburgMines" },
  { name: `${SHIFTS.pizzaBaking.Emoji} Pizza Planet Kitchen`, value: "pizzaBaking" },
  { name: `${SHIFTS.pizzaDelivery.Emoji} Pizza Planet Delivery`, value: "pizzaDelivery" },
  { name: `${SHIFTS.stylezSalon.Emoji} Stylez Salon`, value: "stylezSalon" },
  { name: `${SHIFTS.janitor.Emoji} Green Clean`, value: "janitor" },
  { name: `${SHIFTS.woodCutter.Emoji} Lovely Lumber`, value: "woodCutter" },
];
const timeOptions = [
  { name: "1 minute", value: "1" },
  { name: "10 minutes", value: "10" },
  { name: "15 minutes", value: "15" },
  { name: "20 minutes", value: "20" },
  { name: "25 minutes", value: "25" },
  { name: "30 minutes", value: "30" },
  { name: "35 minutes", value: "35" },
  { name: "40 minutes", value: "40" },
  { name: "45 minutes", value: "45" },
];


/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "shift",
  description: "used to manage shifts",
  category: "BLOXBURG",
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "start",
        description: "start a shift",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "job-location",
            description: "pick where to host the shift",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: jobOptions
          },
          {
            name: "start-time",
            description: "pick when the shift will start",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: timeOptions
          },
          {
              name: "required-reactions",
              description: "how many reactions are needed to start?",
              type: ApplicationCommandOptionType.Number,
              required: true,
              min_value: 1
          },
          {
              name: "neighborhood-code",
              description: "What is the correct neighborhood code?",
              type: 3,
              required: true,
              choices: [
                { name: "Primary (SkillsLevelUpBro)", value: "SkillsLevelUpBro" },
                { name: "Private (StevenO789) [Shift Managers Only]", value: "StevenO789" },
              ]
          }
        ],
      },
      {
        name: "end",
        description: "end a shift",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "shift-id",
            description: "the id of the shift to end",
            type: ApplicationCommandOptionType.Number,
            required: true,
            autocomplete: true
          }
        ],
      },
      {
        name: "list",
        description: "lists all active shifts",
        type: ApplicationCommandOptionType.Subcommand
      },
      {
        name: "plan",
        description: "Plan a shift",
        type: 1, // Subcommand type
        options: [
          {
            name: "job",
            description: "pick where to host the shift",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: jobOptions
          },
          {
            name: "start-time",
            description: "Input the hammertime code when the shift will start, choose the very last option",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "reactions",
            description: "how many reactions are needed to start?",
            type: ApplicationCommandOptionType.Number,
            required: true,
            min_value: 1,
            max_value: 5,
          },
          {
            name: "image",
            description: "Provide an image URL for the shift",
            type: ApplicationCommandOptionType.String,
            required: false, 
          }
        ],
      },
    ],
  },
  
  async interactionRun(interaction, data) {
    const client = interaction.client
    

    const messageChannelID = interaction.channel.id;
    const allowedchannelID = client.shiftdatabase.get("allowedchannelID-");
    if (allowedchannelID && messageChannelID !== allowedchannelID && (interaction.member.permissions.has("Administrator")) == false) {
        return interaction.followUp({
            content: `You cannot use that command here! You can only use the \`/shift\` command in <#${allowedchannelID}>.`
        });
    }
    const iiichanel = client.shiftdatabase.get(`channelID-`)
   
    if (!iiichanel) return await interaction.followUp("Shifts channel not configured!");
  const shiftChannel = interaction.member.guild.channels.cache.get(iiichanel);
    if (!shiftChannel) return await interaction.followUp("Shifts channel not found!");

   
    const idid = require("@root/config").CUSTOM.SHIFT_MANAGER;
      if((interaction.member.roles.cache.has(idid)) == false){
        return interaction.followUp("You don't have permission to use this bot. You need to be level 2 to be able to host your own shifts!")
      }

    const sub = interaction.options.getSubcommand();

   
    if (sub === "start") {

      const messageChannelID = interaction.channel.id;
       
       

        function getCurrentTimeInGMT3() {
          const now = new Date();
          const utcTime = now.getTime();
          const gmtPlus3Offset = 3 * 60 * 60 * 1000;
          const gmtPlus3Time = new Date(utcTime + gmtPlus3Offset);
      
          const hours = gmtPlus3Time.getUTCHours();
          const minutes = gmtPlus3Time.getUTCMinutes();
      
          return { hours, minutes };
      }
      
      const currentTime = getCurrentTimeInGMT3();
      const currentHours = currentTime.hours;
      const currentMinutes = currentTime.minutes;
      const currentTimeInMinutes = currentHours * 60 + currentMinutes;
      
      const range1Start = 14 * 60;  // 2:00 PM in minutes
      const range1End = 23 * 60;    // 11:00 PM in minutes
      const range2Start = 23 * 60;  // 11:00 PM in minutes
      const range2End = 6 * 60;     // 6:00 AM in minutes
      const range3Start = 6 * 60;   // 6:00 AM in minutes
      const range3End = 14 * 60;    // 2:00 PM in minutes
      const emojiFullID = client.shiftdatabase.get("emojiFullID")
      const emojiID = client.shiftdatabase.get("emojiID")
      const coeptusID = client.shiftdatabase.get("coeptus-");
      const bloxyID = client.shiftdatabase.get("bloxy-");
      const riversideID = client.shiftdatabase.get("riverside-");
      let role;
      if (currentTimeInMinutes >= range1Start && currentTimeInMinutes < range1End) {
          role = coeptusID;
      } else if (currentTimeInMinutes >= range2Start || currentTimeInMinutes < range2End) {
          role = bloxyID;
      } else if (currentTimeInMinutes >= range3Start && currentTimeInMinutes < range3End) {
          role = riversideID;
      }  

      function getDynamicTimestampByMinutes(minutesToAdd) {
          const now = new Date();
          const dynamicTime = new Date(now.getTime() + (minutesToAdd * 60000));
          const unixTimestamp = Math.floor(dynamicTime.getTime() / 1000);
          return unixTimestamp;
      }
      
      const start = interaction.options.getString("start-time");
      const job = interaction.options.getString("job-location");
      let niceJobName;
      if (job == "benIceCream") {
          niceJobName = "🍦 Ben's Ice Cream";
      } else if (job == "bffMarket") {
          niceJobName = "🛒 BFF Market";
      } else if (job == "bloxBurger") {
          niceJobName = "🍔 Blox Burger";
      } else if (job == "fishing") {
          niceJobName = "🎣 The Fishing Hut";
      } else if (job == "mechanic") {
          niceJobName = "🔧 Mike's Motors";
      } else if (job == "bloxburgMines") {
          niceJobName = "⛏️ Bloxburg Mines";
      } else if (job == "pizzaBaking") {
          niceJobName = "🍕 Pizza Planet Kitchen";
      } else if (job == "pizzaDelivery") {
          niceJobName = "🛵 Pizza Planet Delivery";
      } else if (job == "stylezSalon") {
          niceJobName = "💈 Stylez Salon";
      } else if (job =="janitor"){
          niceJobName = "🧹 Green Clean"
      }else if(job == "woodCutter"){
          niceJobName = "🪓 Lovely Lumber"
      }

      const dominus = client.shiftdatabase.get("dominus-")
      const requiredReactions = interaction.options.getNumber("required-reactions");
      const neighborhoodCode = interaction.options.getString("neighborhood-code");
      if(neighborhoodCode == "StevenO789"){
        const idid1 = require("@root/config").CUSTOM.LEADER;
      if((interaction.member.roles.cache.has(idid1)) == false){
        return interaction.followUp("You don't have permission to use that neighborhood, private neighborhoods are only for shift managers.")
      }
      }
      const roleID = role;
      const channelID = client.shiftdatabase.get("channelID-");
      const userID = interaction.user.id;
      const dynamicTimestamp = getDynamicTimestampByMinutes(start);
      const min = 100000; // Smallest 6-digit number
      const max = 999999; // Largest 6-digit number
      const shiftID = Math.floor(Math.random() * (max - min + 1)) + min;

      const exampleEmbed = new EmbedBuilder()
          .setTitle(`Shift announced by ${interaction.user.username}`)
          .setURL('https://www.roblox.com/games/185655149/Welcome-to-Bloxburg')
          .setAuthor({ name: `Host: ${interaction.user.username}` })
          .setDescription(`New shift is starting <t:${dynamicTimestamp}:R>.\nPress the join button to join!\nHost: <@${userID}>`)
          .setThumbnail(`${interaction.user.displayAvatarURL()}`)
          .addFields(
              { name: 'Job Location', value: `${niceJobName}` },
              { name: 'Required Reactions', value: `${requiredReactions}` },
              { name: 'Neighborhood Code', value: `${neighborhoodCode}` },
              { name: 'Workers', value: `No one has clocked in yet, be the first one to clock-in by pressing the big green button below, it's hard to miss.` },
              { name: "Shift ID", value: `${shiftID}` }
          )
          .setTimestamp()
          .setColor(color);
          if(interaction.guild.iconURL()){
          exampleEmbed.setImage(`${interaction.guild.iconURL()}`)
          }

          const serverCooldownDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
          const regularUserCooldownDuration = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
          const boosterUserCooldownDuration = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
          
      
          const upcomingEvents = client.eventdatabase.get("upcomingEvents") || [];
          const twoHoursInMilliseconds = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
          const currentTimestamp = Date.now(); // Get the current timestamp

          if (upcomingEvents.length > 0) {
              // Get the start time and host of the closest upcoming event
              const nextEvent = upcomingEvents[0]; // Assuming the events are sorted by start time
              const nextEventStartTime = nextEvent.startTime || 0; // Get the closest event start time
              const timeUntilEvent = nextEventStartTime - currentTimestamp;

              const eventHost = nextEvent.hostId; // Get the host of the next event

              // Check if the user is the host of the next event or if the event is within 2 hours
              if (nextEventStartTime && timeUntilEvent <= twoHoursInMilliseconds && timeUntilEvent > 0 && interaction.user.id !== eventHost) {
                  return interaction.followUp({
                      content: "There is a shift or event happening soon. You may not host a shift now."
                  });
              }
          }
          
          const isUserBooster = interaction.member.premiumSince !== null;
          const individualCooldownDuration = isUserBooster ? boosterUserCooldownDuration : regularUserCooldownDuration;
          
          // Retrieve last command timestamps from the database
          const lastServerCommandTimestamp = client.shiftdatabase.get("lastServerCommand") || 0;
          const lastUserCommandTimestamp = client.shiftdatabase.get(`${userID}-lastCommand`) || 0;
          
          // Calculate when the cooldowns will end
          const serverCooldownEndTimestamp = lastServerCommandTimestamp + serverCooldownDuration;
          const userCooldownEndTimestamp = lastUserCommandTimestamp + individualCooldownDuration;
          
          const isServerCooldownActive = currentTimestamp < serverCooldownEndTimestamp;
          const isUserCooldownActive = currentTimestamp < userCooldownEndTimestamp;
          
          if (isServerCooldownActive) {
              const serverCooldownRemaining = Math.floor(serverCooldownEndTimestamp / 1000);
              return interaction.followUp({
                  content: `We're on break! Sorry, you cannot host another session right now. Try again <t:${serverCooldownRemaining}:R> (<t:${serverCooldownRemaining}:F>).`,
              
              });
          }
          
          if (isUserCooldownActive) {
            const userCooldownRemaining = Math.floor(userCooldownEndTimestamp / 1000); // Convert to seconds
            const userCooldownDurationMs = userCooldownEndTimestamp - currentTimestamp; // Get remaining time in milliseconds
        
            // Check if the cooldown is permanent (cooldownEndTimestamp is longer than 100 years)
            if (userCooldownEndTimestamp > 100 * 12 * 30 * 24 * 60 * 60 * 1000) {
                return interaction.followUp({
                    content: `You are permanently banned from hosting shifts.`,
                });
            }
        
            // Check if the cooldown is longer than 23 hours
            if (userCooldownDurationMs > 23 * 60 * 60 * 1000) {
                return interaction.followUp({
                    content: `You are currently banned from hosting shifts. You may host again on <t:${userCooldownRemaining}:F>.`,
                });
            }
        
            // Normal cooldown message if it's under 2 hours
            return interaction.followUp({
                content: `Wait a minute! Let someone else have a chance to host. You can host again <t:${userCooldownRemaining}:R> (<t:${userCooldownRemaining}:F>).`,
            });
        }
        
        
         
          const job1 = extractEmoji(niceJobName)
       
          const jobDetail = getJobDetails(job1)
       
         
          client.channels.fetch(channelID)
          /**
   * @param {import("discord.js").TextChannel} channel
   */
          .then(async (channel) => {
            
              if (channel && channel.send) {
                let buttonsRow = new ActionRowBuilder().addComponents(
                  new ButtonBuilder().setCustomId("join").setLabel("Clock-in").setStyle(ButtonStyle.Success).setEmoji(jobDetail.Emoji),
                  new ButtonBuilder().setCustomId("leave").setLabel("Clock-out").setStyle(ButtonStyle.Danger),
                  new ButtonBuilder().setStyle(ButtonStyle.Link).setURL("https://discord.com/channels/1256349528190222386/1267959178249371770").setLabel("Rules")
                );
                  const message = await channel.send({
                      content: `# Who's ready to work at ${niceJobName}?\n\n<@&${roleID}> <@&${dominus}>`,
                      embeds: [exampleEmbed],
                      components: [buttonsRow]
                  });

               
                 const messageID = message.id
               
                  client.shiftdatabase.set(`${shiftID}-shiftID`, messageID)
                  const timeToStart = Number(start)
                  if(!timeToStart){

                  }else{
                  const timeSet = timeToStart * 60 * 1000
                  const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: timeSet });
                  
                  const users = [];
                  
                  collector.on('collect', (i) => {
                    
                      if(i.user.id == client.user.id){
                        
                      }
                        if (i.customId === 'join') {
                          if (users.includes(i.user.id)) {
                              i.reply({
                                  content: "You already have reacted!",
                                  ephemeral: true
                              });
                          } else {
                              i.reply({
                                  content: "Thanks for reacting! Please understand you are now obligated to join the shift.",
                                  ephemeral: true
                              });
                              users.push(i.user.id);
                          }
                      } else if (i.customId === 'leave') {
                          if (users.includes(i.user.id)) {
                              users.splice(users.indexOf(i.user.id), 1);
                              i.reply({
                                  content: "You have clocked out successfully.",
                                  ephemeral: true
                              });
                          } else {
                              i.reply({
                                  content: "You were not clocked in.",
                                  ephemeral: true
                              });
                          }
                      } 
                            let ping = '';
                            if (users.length === 0) {
                                ping = `No one has clocked in yet, be the first one to clock-in by pressing the big green button below, it's hard to miss.`;
                            } else {
                                users.forEach((user, index) => {
                                if (index === users.length - 1) {
                                  ping += `<@${user}>.`;  // Add a period after the last user
                                } else {
                                  ping += `<@${user}>, `;  // Add a comma after every other user
                                }
                            });
                      }
                          const newEmbed = new EmbedBuilder()
                          .setTitle(`Shift announced by ${interaction.user.username}`)
                          .setURL('https://www.roblox.com/games/185655149/Welcome-to-Bloxburg')
                          .setAuthor({ name: `Host: ${interaction.user.username}` })
                          .setDescription(`New shift is starting <t:${dynamicTimestamp}:R>.\nPress the join button to join!\nHost: <@${userID}>`)
                          .setThumbnail(`${interaction.user.displayAvatarURL()}`)
                          .addFields(
                              { name: 'Job Location', value: `${niceJobName}` },
                              { name: 'Required Reactions', value: `${requiredReactions}` },
                              { name: 'Neighborhood Code', value: `${neighborhoodCode}` },
                              { name: 'Workers', value: `${ping}` },
                              { name: "Shift ID", value: `${shiftID}` }
                          )
                          .setTimestamp()
                          .setColor(color);
                          message.edit({
                            embeds: [newEmbed]
                          })
                          if(interaction.guild.iconURL()){
                          exampleEmbed.setImage(`${interaction.guild.iconURL()}`)
                          };

                    
                      }
                     
                  
                  );


                  
                  collector.on('end', async (collected) => {
                    let buttonsRow1 = new ActionRowBuilder().addComponents(
                      new ButtonBuilder().setCustomId("join").setLabel("Clock-in").setStyle(ButtonStyle.Success).setEmoji(jobDetail.Emoji).setDisabled(true),
                      new ButtonBuilder().setCustomId("leave").setLabel("Clock-out").setStyle(ButtonStyle.Danger).setDisabled(true),
                      new ButtonBuilder().setStyle(ButtonStyle.Link).setURL("https://discord.com/channels/1256349528190222386/1267959178249371770").setLabel("Rules")
                    );

                    await message.edit({
                      components: [buttonsRow1]
                    })
                   
                      const num = Number(requiredReactions);
             
          
                      const i = Number(collected.size);
                      if(users.length <= 0){
                        client.shiftdatabase.delete("lastServerCommand")
                        client.shiftdatabase.delete(`${shiftID}-shiftID`)
                      return message.reply({
                      content: "This shift has been cancelled because no one clocked-in!"
                      })
                      }
                     
                      
                      if(users.length >= num){

                          
                      
                      const checking = client.shiftdatabase.get(`${shiftID}-shiftID`);
                    
                      if(checking){
                      let ping = '';
                      users.forEach((user, index) => {
                          if (index === users.length - 1) {
                              ping += `<@${user}>.`;  // Add a period after the last user
                          } else {
                              ping += `<@${user}>, `;  // Add a comma after every other user
                          }
                      });
                  
                      
                      message.reply({
                          content: `# The shift posted by <@${interaction.user.id}> has just started.\nPlease enter \`${neighborhoodCode}\` in the [Bloxburg](<https://www.roblox.com/games/185655149/Welcome-to-Bloxburg>) Neighborhoods menu to attend.\nShift job: ${niceJobName}\n**Workers:** ${ping}`
                      })
                  }
              }else{
                  
                  
                  message.reply({
                      content: `Not enough workers! There were not enough workers to start the shift.`
                  })
                  client.shiftdatabase.delete("lastServerCommand")
                  client.shiftdatabase.delete(`${shiftID}-shiftID`)
              }
             
                  });
              }

                  interaction.followUp({
                      content: `Successfully posted shift. <#${channelID}>\nShift ID: \`${shiftID}\``,
                  });

                
                  client.shiftdatabase.set("lastServerCommand", currentTimestamp);
                  client.shiftdatabase.set(`${userID}-lastCommand`, currentTimestamp);

              } else {
                  throw new Error("Channel not found or `channel.send` is not a function");
              }
          })
          .catch(error => {
              console.error("Error fetching the channel or sending the message:", error);
          });

    }

    else if (sub === "end") {
      
        const shift_id1 = interaction.options.getNumber("shift-id")
        const shiftID = shift_id1.toString()
    
        const messageID = client.shiftdatabase.get(`${shiftID}-shiftID`)
       
        if (!messageID) {
           
            await interaction.followUp({
                content: `Shift ID ${shiftID} is not found!`
            })
            return
        }
        const channelID = interaction.client.shiftdatabase.get("channelID-");

        interaction.client.channels.fetch(channelID)
            .then(async (channel) => {
                if (channel && channel.send) {
                    const message = await channel.messages.fetch(messageID)
                    

                    const embedDescription = (message.embeds[0].description)

                    function extractNumber(str) {
                        const regex = /<@(\d+)>/;
                        const match = str.match(regex);
                        return match ? match[1] : null;
                    }

                    function extractTimestamp(str) {
                        const regex = /<t:(\d+):R>/;
                        const match = str.match(regex);
                        return match ? match[1] : null;
                    }

                    const timestamp = extractTimestamp(embedDescription);
                    const authorID = extractNumber(embedDescription);
                    const serverCooldownDuration = 2 * 60 * 60 * 1000; 
                    const lastServerCommandTimestamp = interaction.client.shiftdatabase.get("lastServerCommand");
                    const serverCooldownEndTimestamp = lastServerCommandTimestamp ? lastServerCommandTimestamp + serverCooldownDuration : 0;
                    const howMuchLeftServerTimestamp = Math.floor(serverCooldownEndTimestamp / 1000);

                    if (!interaction.guild) {
                      return message.reply("This command can only be used in a server.");
                    }

                    let upcomingShifts = interaction.client.eventdatabase.get("upcomingEvents") || [];

                    // Fetch the first event details from the upcoming shifts array
                    let eventDetails = upcomingShifts.length > 0 ? upcomingShifts[0] : null;
                    let currentTime = Date.now();

                    // Check if the event has started
                    if (eventDetails && currentTime >= eventDetails.startTime) {
                        // Check if the person ending the shift is the event host or an admin
                        if (eventDetails.hostId === interaction.user.id || interaction.member.permissions.has("Administrator")) {
                            message.reply({
                                content: `This shift that was scheduled for <t:${timestamp}:f> has concluded.`
                            });

                            interaction.client.shiftdatabase.delete(`${shiftID}-shiftID`);

                            // Check if there are any remaining events to delete from Discord's scheduled events
                            if (eventDetails.eventId && interaction.guild && interaction.guild.scheduledEvents) {
                                try {
                                    await interaction.guild.scheduledEvents.delete(eventDetails.eventId);
                                } catch (error) {
                                    await message.reply({
                                        content: 'There was an error deleting the scheduled event.'
                                    });
                                }
                            }
                          const channelID = client.shiftdatabase.get("planAhead-"); // Plan-ahead
                          const channel = await interaction.guild.channels.cache.get(channelID);
                      
                            if (channel) {
                              try {
                                  // Fetch messages from the channel
                                  const messages = await channel.messages.fetch({ limit: 10 });
                                  const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
                          
                                  // Get the first event in the upcomingEvents array
                                  const upcomingEvents = interaction.client.eventdatabase.get("upcomingEvents") || [];
                                  const currentEvent = upcomingEvents[0];

                          
                                  // If the message is found, delete it
                                  if (currentEvent) {
                                    const messageToDelete = sortedMessages.find(msg => msg.content.includes(`-# Event ID: ${currentEvent.eventId}`));
                                      if (messageToDelete) {
                                        await messageToDelete.delete();
                                        upcomingShifts.splice(0, 1);

                                        // Store the updated array back in the database
                                        await interaction.client.eventdatabase.set("upcomingEvents", upcomingShifts);
                                    } else {
                                        await interaction.followUp({
                                            content: 'No message found related to this event.'
                                        });
                                    }
                                  } else {
                                      await message.reply({
                                          content: 'Why no message?'
                                      });
                                  }
                              } catch (error) {
                                  await message.reply({
                                      content: 'There was an error deleting the event message.'
                                  });
                              }
                          } else {
                              await interaction.followUp({
                                  content: `You are not the host of this shift!`
                              });
                              return;
                          }
                        } else {
                            await interaction.followUp({
                                content: `You are not the host of this shift!`
                            });
                            return;
                          }
                    } else if (authorID === interaction.user.id || interaction.member.permissions.has("Administrator")) {
                        // Proceed if the author or an admin is ending the shift
                        message.reply({
                            content: `This shift that was scheduled for <t:${timestamp}:f> has concluded.`
                        });

                        interaction.client.shiftdatabase.delete(`${shiftID}-shiftID`);
                    } else {
                        await interaction.followUp({
                            content: `You didn't host that shift!`
                        });
                        return;
                    }
                }
            })
              await interaction.followUp({
                  content: `Successfully ended the shift.`
              });
            
                  const targetData = await getUser(interaction.user);
                  targetData.reputation.received += 1;

 
  await targetData.save();


  let allThreads = [];
  await client.threadsdatabase.forEach((value, key) => {
    const ee = extractNumber(key);
    const obj = {
      id: ee[0],
      thread: value
    };
    allThreads.push(obj);
  });



    const existingThread = allThreads.find(info => Number(info.id) === Number(shiftID));

    if (existingThread) {
      // If thread exists, send the reminder embed
      const thread = interaction.guild.channels.cache.get(existingThread.thread);
      await thread.delete()
      client.threadsdatabase.delete(`shift-${shiftID}`)
    }
  
    }
    else if (sub === "list") {
      let filteredKeys = []
            
           await interaction.client.shiftdatabase.forEach((value, key, index) => {
            
              
                if(key.endsWith('-shiftID')){
                    filteredKeys.push({
                        key: key,
                        value: value
                    })
                }

                
            })

            const exampleEmbed = new EmbedBuilder()
            .setTitle("Active Shifts")
            .setColor(require("@root/config").EMBED_COLORS.BOT_EMBED)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp()
            .setDescription(`To end a shift, please use the \`/shift end\` command`);
            if(filteredKeys.length == 0){
                exampleEmbed.addFields({ name: "No shifts available", value: "No shifts are available right now!"})
            }else{
                filteredKeys.forEach(db => {
                    function extractNumber(str) {
                        // Use regular expression to match all numbers in the string
                        const matches = str.match(/\d+/g);
                      
                        // Convert the matched strings to numbers
                        const numbers = matches ? matches.map(Number) : [];
                      
                        return numbers;
                      }
                    const shiftID = extractNumber(db.key)
                   
                    const messageID = db.value 
                  
                  
                    const channelID = client.shiftdatabase.get("channelID-");
                    const serverID = interaction.guildId
                    exampleEmbed.addFields({
                        name: `Shift ${shiftID}`,
                        value: `[Message Link](<https://discord.com/channels/${serverID}/${channelID}/${messageID}>)`,
                        inline: false
                    })

                })
            }
            await interaction.followUp({
                embeds: [exampleEmbed]
            });
    } else if (sub === 'plan') {
        const start = interaction.options.getString("start-time");
        const job = interaction.options.getString("job");
        const minimumWorkers = interaction.options.getNumber("reactions");
        const image = interaction.options.getString("image");
        
        let niceJobName;
        switch (job) {
            case "benIceCream":
                niceJobName = "🍦 Ben's Ice Cream";
                break;
            case "bffMarket":
                niceJobName = "🛒 BFF Market";
                break;
            case "bloxBurger":
                niceJobName = "🍔 Blox Burger";
                break;
            case "fishing":
                niceJobName = "🎣 The Fishing Hut";
                break;
            case "mechanic":
                niceJobName = "🔧 Mike's Motors";
                break;
            case "bloxburgMines":
                niceJobName = "⛏️ Bloxburg Mines";
                break;
            case "pizzaBaking":
                niceJobName = "🍕 Pizza Planet Kitchen";
                break;
            case "pizzaDelivery":
                niceJobName = "🛵 Pizza Planet Delivery";
                break;
            case "stylezSalon":
                niceJobName = "💈 Stylez Salon";
                break;
            case "janitor":
                niceJobName = "🧹 Green Clean";
                break;
            case "woodCutter":
                niceJobName = "🪓 Lovely Lumber";
                break;
            default:
                niceJobName = "Unknown Job"; // Fallback
        }
    
        // Calculate start time based on the selected duration
        const unixTimestamp = parseInt(start);
        const startTime = new Date(unixTimestamp * 1000); // Convert seconds to milliseconds
        const fortyFive = new Date(startTime.getTime() - 45 * 60 * 1000);  // 45 minutes before the event

        // Check if the timestamp is valid
        if (isNaN(unixTimestamp) || unixTimestamp <= 0 || startTime.getTime() < Date.now()) {
            return interaction.followUp("Please provide a valid future Unix timestamp in seconds.");
        }

        const upcomingShifts = client.eventdatabase.get("upcomingEvents") || [];
        const twoHoursInMilliseconds = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

        // Get the start time of the new event
        const newEventStart = startTime.getTime(); 

        // Check if any event is within 2 hours before or after the new event
        if (upcomingShifts.length > 0) {
            const conflictEvent = upcomingShifts.find(event => {
                const eventStartTime = new Date(event.startTime).getTime();
                return Math.abs(newEventStart - eventStartTime) < twoHoursInMilliseconds;
            });

            // If a conflicting event is found, prevent scheduling
            if (conflictEvent) {
                return interaction.followUp({
                    content: `Another event is happening within 2 hours of this event. Please plan your event or shift for another time.`
                });
            }
        }
    
        try {
          const voiceChannelId = "1267959183962279938"; // Your voice channel ID
          const channelID = client.shiftdatabase.get("planAhead-"); //plan-ahead
          
          const eventDurationMinutes = 120; // Set the duration of the event to 120 minutes (2 hours)
          const endTime = new Date(startTime.getTime() + eventDurationMinutes * 60000); // Calculate end time

          const job1 = extractEmoji(niceJobName)
       
          const jobDetail = getJobDetails(job1)
          
          // Create the scheduled event
          interaction.guild.scheduledEvents.create({
            name: `${niceJobName} Shift`,
            description: `Join us for a shift at ${niceJobName}!`,
            scheduledStartTime: startTime.toISOString(),
            scheduledEndTime: endTime.toISOString(),
            image: image,
            privacyLevel: 2, // GUILD_ONLY
            entityType: 3, // Change to 3 for voice events
            entityMetadata: {
            channel_id: voiceChannelId,
            location: "Bloxburg",
            },
          })
          .then((event) => {

            const eventDetails = {
              startTime: startTime.getTime(), // Event start time in milliseconds
              hostId: interaction.user.id,
              eventId: event.id,
            };

            const upcomingShifts = client.eventdatabase.get("upcomingEvents") || [];

            upcomingShifts.push(eventDetails);

            // Sort the upcomingShifts array from earliest to latest
            upcomingShifts.sort((a, b) => a.startTime - b.startTime);

            // Store the sorted arrays back in the database
            client.eventdatabase.set("upcomingEvents", upcomingShifts);
            const announcementMessage = `
            # <@ 1267959053108383765>
            **Host: ** <@${interaction.user.id}>
            **Workers Needed:** ${minimumWorkers}
            Respond to the Event if you're coming, and stay tuned to <#1267959203486502963> for the session start!
            https://discord.com/events/${interaction.guild.id}/${event.id}
            
            -# Event ID: ${event.id}
            -# <:BEEwarn:1268469054931210291> Starting a shift within 2 hours of this scheduled shift will result in demotion!`;
          
            interaction.guild.channels.fetch(channelID)
            .then((announcementChannel) => {
            return announcementChannel.send(announcementMessage);
            })
            .then(async (announcementMessage) => {
            await announcementMessage.react(jobDetail.Emoji);
            interaction.followUp(`Successfully created the event: **${event.name}** starting at **<t:${start}:F>**!`);
            })
            .catch((error) => {
            console.error("Error sending announcement:", error);
            interaction.followUp("Error sending the announcement message.");
            });
          
            // Start checking for event times
            const checkEventTimers = () => {
            let currentTimestamp = Date.now();
            let timeUntilFortyFive = fortyFive.getTime() - currentTimestamp;
          
            if (timeUntilFortyFive <= 1000) {
          
              // Fetch the event channel
              interaction.guild.channels.fetch(channelID)
              .then((channel) => {
              if (!channel) {
              console.error("Channel not found or bot lacks permission to access the channel.");
              return;
              } 
          
            // Create a private thread
            channel.threads.create({
              name: `Shift Reminder for ${interaction.user.username}`,
              autoArchiveDuration: 60, // Auto-archive after 1 hour
              type: ChannelType.PrivateThread, // Create a private thread
              invitable: true
            })
            .then((thread) => {
            // Add the user who triggered the command to the thread
              thread.members.add(interaction.user.id)
            .then(() => {
          
            const confirmButton = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('confirm_shift').setLabel('Confirm Shift').setStyle(ButtonStyle.Success),
              new ButtonBuilder().setCustomId('cancel_shift').setLabel('Cancel Shift').setStyle(ButtonStyle.Danger)
            );
          
          // Send the reminder message
            const remind = new EmbedBuilder()
              .setColor(color)
              .setTitle("Event Reminder!")
              .setDescription(`Hey, you have a ${niceJobName} shift starting <t:${unixTimestamp}:R>`)
              .setFooter({
              text: "Please press the button below to confirm the shift"
            });
          
            thread.send({
              content: `<@${interaction.user.id}>`, 
              embeds: [remind],
              components: [confirmButton],
            })

            const reminderInterval = setInterval(() => {
                thread.send({
                  content: `<@${interaction.user.id}>, you have yet to confirm or cancel the shift, please press a button to confirm or cancel it.`, 
                });
              }, 5 * 60 * 1000);
          
              const filter = (ButtonInteraction) => {
                return ButtonInteraction.user.id === interaction.user.id; // Collect for both confirm and cancel buttons
              };
      
              const collector = thread.createMessageComponentCollector({ filter, time: 45 * 60000 }); // 45 minutes collector
        
              collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.customId === 'confirm_shift') {
                    await buttonInteraction.reply({ 
                        content: 'Shift confirmed! Cooldown has been removed.\nYou can use the \`/Shift Start\` command now\nThis thread will automatically delete in 30 seconds', 
                        ephemeral: true,
                    });
        
                    clearInterval(reminderInterval);
        
                    setTimeout(async () => {
                        await thread.delete("Shift confirmed, deleting thread."); // Optional reason for deletion
                    }, 30000); // 30000 milliseconds = 30 seconds
        
                } else if (buttonInteraction.customId === 'cancel_shift') {
                  await buttonInteraction.reply({
                      content: 'You have cancelled the shift.',
                      ephemeral: true,
                  });
              
                  const channelID = client.shiftdatabase.get("planAhead-"); // Plan-ahead
                  const channel = await interaction.guild.channels.cache.get(channelID);
              
                  if (channel) {
                      try {
                          // Fetch the latest 10 messages from the channel
                          const messages = await channel.messages.fetch({ limit: 10 });
                          const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
              
                          // Get the first event in the upcomingEvents array
                          const upcomingEvents = interaction.client.eventdatabase.get("upcomingEvents") || [];
                          const currentEvent = upcomingEvents[0];
              
                          if (currentEvent) {
                              // Find the message related to the current event ID
                              const messageToDelete = sortedMessages.find(msg => msg.content.includes(`Event ID: ${currentEvent.eventId}`));
              
                              // If the message is found, delete it
                              if (messageToDelete) {
                                  await messageToDelete.delete();
                              } else {
                                  await interaction.followUp({
                                      content: 'No message found related to this event.'
                                  });
                              }
                          } else {
                              await interaction.followUp({
                                  content: 'No upcoming event found.'
                              });
                          }
                      } catch (error) {
                          await interaction.followUp({
                              content: 'There was an error deleting the event message.'
                          });
                      }
                  }
              
                  // Fetch the upcomingEvents array
                  let nextEventArray = interaction.client.eventdatabase.get("upcomingEvents");
              
                  // Remove the first event from the array and update the database
                  if (nextEventArray && nextEventArray.length > 0) {
                      const currentEvent = nextEventArray.shift(); // Removes and returns the first event
              
                      await interaction.client.eventdatabase.set("upcomingEvents", nextEventArray);
              
                      // If the event is a scheduled Discord event, delete it
                      if (interaction.guild && interaction.guild.scheduledEvents) {
                          try {
                              await interaction.guild.scheduledEvents.delete(currentEvent.eventId);
                          } catch (error) {
                              await interaction.followUp({
                                  content: 'There was an error deleting the scheduled event.'
                              });
                          }
                      }
                  }
              
                  // Optionally delete the thread or take any other necessary action
                  setTimeout(async () => {
                      await thread.delete("Shift cancelled, deleting thread."); // Optional reason for deletion
                  }, 30000); // 30000 milliseconds = 30 seconds
              
                  collector.stop(); // Stop the collector
                }
                });
                   })
                  .catch((error) => console.error("Error adding user to thread:", error)); // Catch for adding user to thread
                  })
                  .catch((error) => console.error("Error creating thread:", error)); // Catch for thread creation
                  })
                  .catch((error) => console.error("Error fetching channel:", error)); // Catch for fetching channel
          
            clearInterval(interval);  // Stop the interval
              return;
            }
          
          // Dynamically adjust interval
            let nextCheckTime = Math.min(startTime.getTime(), timeUntilFortyFive);
            let intervalTime;
          
            if (nextCheckTime > 86400000) { // More than 24 hours remaining
              intervalTime = 86400000; // Check every 24 hours
          } else if (nextCheckTime > 43200000) { // More than 12 hours remaining
              intervalTime = 43200000; // Check every 12 hours
          } else if (nextCheckTime > 21600000) { // More than 6 hours remaining
              intervalTime = 21600000; // Check every 6 hours
          } else if (nextCheckTime > 10800000) { // More than 3 hours remaining
              intervalTime = 10800000; // Check every 3 hours
          } else if (nextCheckTime > 7200000) { // More than 2 hours remaining
              intervalTime = 7200000; // Check every 2 hours
          } else if (nextCheckTime > 3600000) { // More than 1 hour remaining
              intervalTime = 3600000; // Check every 1 hour
          } else if (nextCheckTime > 1800000) { // Between 1 hour and 30 minutes
              intervalTime = 1800000; // Check every 30 minutes
          } else if (nextCheckTime > 1200000) { // Between 30 and 20 minutes
              intervalTime = 1200000; // Check every 20 minutes
          } else if (nextCheckTime > 900000) { // Between 20 and 15 minutes
              intervalTime = 900000; // Check every 15 minutes
          } else if (nextCheckTime > 600000) { // Between 15 and 10 minutes
              intervalTime = 600000; // Check every 10 minutes
          } else if (nextCheckTime > 300000) { // Between 10 and 5 minutes
              intervalTime = 300000; // Check every 5 minutes
          } else if (nextCheckTime > 120000) { // Between 5 and 2 minutes
              intervalTime = 120000; // Check every 2 minutes
          } else { // Less than 2 minutes remaining
              intervalTime = 60000; // Check every 1 minute
          }
          
            // Reset the interval with the new time
            clearInterval(interval);
            interval = setInterval(checkEventTimers, intervalTime);
          };
          
            // Start checking every minute initially
            let interval = setInterval(checkEventTimers, 60000);
            })
            .catch((error) => {
            console.error("Error creating event:", error);
            interaction.followUp("There was an error creating the event. Please try again.");
            });
          } catch (error) {
            console.log("Unexpected error:", error);
            interaction.followUp("There was an unexpected error creating the event.");
          }
    }       
  }
}