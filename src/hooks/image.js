const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('image')
        .setDescription('Ask OpenAI a question')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var raw = JSON.stringify({
                "key": "",
                "prompt": "ultra realistic close up portrait ((beautiful pale cyberpunk female with heavy black eyeliner))",
                "negative_prompt": null,
                "width": "512",
                "height": "512",
                "samples": "1",
                "num_inference_steps": "20",
                "seed": null,
                "guidance_scale": 7.5,
                "safety_checker": "yes",
                "multi_lingual": "no",
                "panorama": "no",
                "self_attention": "no",
                "upscale": "no",
                "embeddings_model": null,
                "webhook": null,
                "track_id": null
            });

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch("https://stablediffusionapi.com/api/v3/text2img", requestOptions)
                .then(response => response.text())
                .then(result => console.log(result))
                .catch(error => console.log('error', error));
        } catch (error) {
            console.error(error);
            await interaction.reply('There was an error processing your request.');
        }
    },
};