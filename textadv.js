#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-write

import { ChatGPTAPI } from "npm:chatgpt";
import { apiKey } from "./cred.js";

class Agent {
  #api;
  #parentMessageId;

  constructor() {
    this.#api = new ChatGPTAPI({
      apiKey,
      completionParams: {
        model: "gpt-4",
        temperature: 1,
        presence_penalty: 0,
      },
      maxResponseTokens: 128,
    });

    this.#parentMessageId = null;
  }

  async sendMessage(msg_str) {
    const res = await this.#api.sendMessage(
      msg_str,
      this.#parentMessageId ? { parentMessageId: this.#parentMessageId } : {}
    );
    this.#parentMessageId = res.id;
    console.log(res.text);
    await Deno.writeTextFile("textadv.txt", `${res.text}\n`, { append: true });
    return res.text;
  }

  get systemMessage() {
    return this.#api._systemMessage;
  }

  set systemMessage(sys_msg) {
    this.#api._systemMessage = sys_msg;
  }
}

const megami = new Agent();
megami.systemMessage =
  "You will act as the goddess of a fantasy isekai that has magic. Your world is in danger and you have summoned a human from the modern world to become a hero to save your world. Starting from the next message, the hero you've summoned will talk to you. You will answer his questions and lead him to his path of adventure. Remember: all messages from the hero will be prefixed by [HERO], and all messages from you will be prefixed by [GODDESS].";

const yuusha = new Agent();
yuusha.systemMessage =
  "You will act as a young man that used to live in the modern world, but has suddenly been summoned to an isekai that you know nothing about. Starting from the next message, you will be talking to that world's goddess. You can ask her questions to gather intel and then start your adventure. Remember: all messages from the goddess will be prefixed by [GODDESS], and all messages from you will be prefixed by [HERO].";

let megami_msg =
  "[GODDESS] Greetings, pretty boy! I am the goddess of this world, and I have summoned you to grant you a second life!";
while (true) {
  const yuusha_msg = await yuusha.sendMessage(megami_msg);
  megami_msg = await megami.sendMessage(yuusha_msg);
}
