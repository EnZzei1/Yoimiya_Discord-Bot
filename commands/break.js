const { Client, Message, MessageEmbed } = require("discord.js");
const axios = require("axios");
const colors = require("../colors.json");

module.exports = {
  name: "lunch-time",
  category: "Interactions",
  description: "When you are in a lunch break time xD",
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
   async execute(message, args, client, Discord) {
    const getGif = async () => {
      const response = await axios.get(
        "https://anime-reactions.uzairashraf.dev/api/reactions",
        {
          params: {
            category: "lunch-break-time",
          },
        }
      );
      return response.data;
    };
    const reactions = await getGif();
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    const embed = new MessageEmbed()
        .setImage(reaction)
        .setTitle(`${message.author.username} is in lunch break time!`)
        .setColor(colors.green)
        .setTimestamp();
    message.channel.send(embed);
  },
};