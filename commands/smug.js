const { Client, Message, MessageEmbed } = require("discord.js");
const axios = require("axios");
const colors = require("../colors.json");

module.exports = {
  name: "smug",
  category: "Interactions",
  description: "What are you up to little mischievous? (0ˍ0)",
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
            category: "smug",
          },
        }
      );
      return response.data;
    };
    const reactions = await getGif();
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    const embed = new MessageEmbed()
        .setImage(reaction)
        .setTitle(message.author.username  + " being smug")
        .setColor(colors.green)
        .setTimestamp();
    message.channel.send(embed);
  },
};