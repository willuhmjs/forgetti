import type { InferenceData } from "$lib/types";
import { WebhookClient, EmbedBuilder, type HexColorString } from "discord.js";
import { get } from "svelte/store";
import colorMap from "$lib/colorMap";
import configStore from "./configStore";

let config = get(configStore);
let lastcooldown = 0;
export default (data: InferenceData) => {
    config = get(configStore);
    try {
        notifyDiscord(data);
    } catch(e) {
        console.error(e);
    }
};

const notifyDiscord = (data: InferenceData) => {
    const webhookClient = new WebhookClient({ url: config.DiscordWebhookURL });

    const boxes = data.box;
    
    const buffer: Buffer = Buffer.from(data.buffer, "base64");

    const notifyEmbed = new EmbedBuilder()
        .setTitle("Spaghetti Detected!")
        .setDescription(`Detected ${boxes.length} spaghetti instance${boxes.length === 1 ? "" : "s"} ≤ ${boxes[0].prob}%`)
        .setTimestamp()
        .setImage("attachment://spaghetti.jpg")
        .setColor(colorMap.get(config.BrandColor) as HexColorString || "#ffffff");

        webhookClient.send({
            embeds: [notifyEmbed],
            files: [{
                attachment: buffer,
                name: "spaghetti.jpg"
            }]
        })
}