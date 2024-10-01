
const { ApplicationCommandOptionType, EmbedBuilder, ButtonStyle, ButtonBuilder, ButtonInteraction, ButtonComponent, ActionRowBuilder, ComponentType } = require("discord.js");
const { config } = require("dotenv");
const color = require("@root/config").EMBED_COLORS.BOT_EMBED
const { getUser } = require("@schemas/User");

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
  { name: "5 minutes", value: "5" },
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
              min_value: 2
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
      }
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


      const { EmbedBuilder } = require("discord.js");
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
          
      
          const currentTimestamp = Date.now();
          
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
                              users.splice(users.indexOf(i.user.id), 1); // Remove the user from the array
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
                          .setDescription(`New shift is starting <t:${dynamicTimestamp}:R>.\nPress the clock-in button to join!\nHost: <@${userID}>`)
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
                    if (authorID == interaction.user.id || interaction.member.permissions.has("Administrator")) {
                        message.reply({
                            content: `This shift that was scheduled for <t:${timestamp}:f> has concluded.`
                        })
                        interaction.client.shiftdatabase.delete(`${shiftID}-shiftID`)
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
      
    }

  },



  };





  