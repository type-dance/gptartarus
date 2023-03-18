#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read --allow-run

import { ChatGPTAPI } from "npm:chatgpt";
import { apiKey } from "./cred.js";

const git_diff_p = Deno.run({
  cmd: ["git", "diff", "--staged"],
  stdout: "piped",
});
const [git_diff_out] = await Promise.all([
  git_diff_p.output(),
  git_diff_p.status(),
]);
const git_diff_out_str = new TextDecoder().decode(git_diff_out);

const api = new ChatGPTAPI({
  apiKey,
  completionParams: {
    temperature: 0,
    presence_penalty: 0,
  },
  debug: true,
  systemMessage:
    "You are a senior software engineer. You will interpret the input message as a git diff, and write a commit message for it as the entire response.",
});
const res = await api.sendMessage(git_diff_out_str);
const git_commit_msg = res.text;

const git_commit_p = Deno.run({
  cmd: ["git", "commit", "--message", git_commit_msg, "--edit"],
});
Deno.exit(await git_commit_p.status());
