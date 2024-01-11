//making text to image using stable diffusion api
// reference:https://stablediffusionapi.com/docs/stable-diffusion-api/

const { SlashCommandBuilder, userMention, AttachmentBuilder } = require("discord.js");
const { req } = require("../utils/fetchApi");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('image')
        .setDescription('Convert your text to image')
        .addStringOption((option) =>
            option.setName('question')
                .setDescription('write description to get an image!')
                .setRequired(true)
                .setMaxLength(6000)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        try {
            const user = userMention(interaction.user.id);
            const question = await interaction.options.getString('question');

            const response = await req({
                base: 'stableDiff',
                uri: 'api/v4/dreambooth',
                method: 'POST',
                redirect: 'follow',
                withCredentials: false,
                data: {
                    "key": `${process.env.STABLE_DIFFUSION_API_KEY}`,
                    "model_id": "sdxl",
                    "prompt": `${question}`,
                    "negative_prompt": null,
                    "width": "1024",
                    "height": "1024",
                    "samples": "1",
                    "num_inference_steps": "30",
                    "safety_checker": "no",
                    "enhance_prompt": "no",
                    "base64": "yes",
                    "seed": null,
                    "guidance_scale": 7.5,
                    "multi_lingual": "no",
                    "panorama": "no",
                    "self_attention": "no",
                    "upscale": "no",
                    "embeddings_model": null,
                    "lora_model": null,
                    "tomesd": "yes",
                    "clip_skip": "2",
                    "use_karras_sigmas": "yes",
                    "vae": null,
                    "lora_strength": null,
                    "scheduler": "UniPCMultistepScheduler",
                    "webhook": null,
                    "track_id": null
                }
            });

            const { data } = response;
            if (data.status === 'processing') {
                return await interaction.editReply({
                    content: `${user}\n Prompt: "${question}"\n Result:Your image is processing in background, you can get this image using /fetchDiffution slashcommand\n id: ${data.id}.`,
                    ephemeral: true
                });
            }
            else if (data.status === 'success') {
                const raw = await req({
                    fullUrl: data.output[0],
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                const { data: base } = raw;
                const image = Buffer.from(base, 'base64');
                const attacment = new AttachmentBuilder(image, { name: 'image.png' });
                return await interaction.editReply({
                    content: `${user}\n Prompt: "${question}"\n`,
                    files: [attacment],
                    ephemeral: true
                });
            }
            return await interaction.editReply({
                content: `${user}\n Prompt: "${question}"\n Result: Bot is confused!`,
                ephemeral: true
            });
        } catch (err) {
            await interaction.editReply({ content: 'An error occurred while processing the command.', ephemeral: true });
            console.log({ err });
        }
    }
}
