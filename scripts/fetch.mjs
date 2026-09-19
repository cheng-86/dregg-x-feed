import { Scraper } from "xactions/client";
import { writeFile, mkdir } from "node:fs/promises";

const handles = ["ember_arlynx", "DreggNet"];

const scraper = new Scraper();
const posts = [];

for (const username of handles) {
  try {
    let count = 0;

    for await (const tweet of scraper.getTweets(username, 10)) {
      posts.push({
        id: tweet.id,
        author: username,
        text: tweet.text,
        created_at: tweet.createdAt ?? tweet.created_at ?? null,
        url:
          tweet.url ??
          `https://x.com/${username}/status/${tweet.id}`
      });

      count++;

      if (count >= 10) break;
    }
  } catch (err) {
    console.error(
      `Failed to read @${username}:`,
      err?.message || err
    );
  }
}

posts.sort((a, b) =>
  String(b.created_at || "").localeCompare(
    String(a.created_at || "")
  )
);

await mkdir("data", { recursive: true });

await writeFile(
  "data/x-posts.json",
  JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      source: "XActions public timeline reader",
      posts
    },
    null,
    2
  )
);

console.log(`Saved ${posts.length} posts`);
