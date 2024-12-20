const DiscordButtons = require('discord-buttons');
const Trace = require('../classes/traceMOE');
const Sauce = require('../classes/sauceNAO');

const utils = require('../utils');

const { traceMoe_token, sauceNao_token } = require('../config');

const traceMoe = new Trace(traceMoe_token);
const sauceNAO = new Sauce(sauceNao_token);

const urlCheck = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|png)/i; // url check regexp

const search = {
    command: 'explore',
    run: async (_, msg, gotErrorsInRow = 0) => {
        let attachments = msg.attachments.size ? msg.attachments.first().url : undefined;
        let url = msg.content.match(urlCheck) ? msg.content.match(urlCheck)[0] : undefined;
        let imageURL = attachments ? attachments : url;


        if (imageURL) {
            try {
                msg.channel.startTyping();
                // Trace.moe is decided to be "main" source provider
                let [trace_error, tracemoe_result] = await traceMoe.search(imageURL);
                let [sauce_error, sauceNAO_result] = await sauceNAO.search(imageURL);

                if (trace_error) throw new Error(trace_error);

                // TODO: SauceNao NSFW filter
                if (!msg.channel.nsfw) {
                    tracemoe_result = tracemoe_result.filter(doc => {
                        return !doc.is_adult
                    });
                }

                let results = [...tracemoe_result.slice(0, 5), ...sauceNAO_result.slice(0, 5)];
                if (results.length == 0) return;

                let resultIndex = 0;
                let other_results = utils.formOtherResults(results, resultIndex);
                let answer;

                answer = await msg.channel.send(utils.formMsgObject(msg, results, resultIndex, other_results, true));


                const filter = (button) => button.clicker.user.id === msg.author.id;

                const collector = answer.createButtonCollector(filter, {
                    time: 120000
                });

            } catch (err) {
                try { // Try Inside Catch looks awful
                    console.log(err);
                    // Missing Permissions
                    if(err?.code == 50013) return msg.author.send("Sorry, I don't have enough permissions to send messages.")

                    let retryBtn = new DiscordButtons.MessageButton()
                        .setLabel("Try Again!")
                        .setStyle("grey")
                        .setEmoji("♻️")
                        .setID("retry");

                    let errorMsg = await msg.channel.send({
                        component: gotErrorsInRow > 3 ?  null : retryBtn ,
                        embed: {
                            description: `An error occurred while searching. Please try again. (ง •̀_•́)ง`,
                            color: 0x00cc4b
                        }
                    });

                    if(gotErrorsInRow <= 3) 
                    {
                        const filter = (button) => button.clicker.user.id === msg.author.id;
                        const collector = errorMsg.createButtonCollector(filter, {
                            time: 60000
                        });
    
                        collector.once('collect', button => {
                            button.defer();
                            search.run(_, msg, ++gotErrorsInRow);
                            collector.stop();
                        })
    
                        collector.on('end', () => {
                            errorMsg.delete();
                        });
                    }

                } catch (e) {
                    console.log(err);
                }
            } finally {
                msg.channel.stopTyping();
            }
        }
        else
        {
            msg.reply("Image not found. Please specify an image.\nExample: `!search URL`")
        }
    }
}

module.exports = search;