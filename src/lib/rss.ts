import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const result = await fetch(feedURL, {
    method: "GET",
    headers: {
      "User-Agent": "gator",
    },
  });
  const textified = await result.text();
  const parser = new XMLParser();
  const parsedXml = parser.parse(textified);

  if (!parsedXml.rss || !parsedXml.rss.channel) {
    throw new Error("Missing channel field in XML response");
  }

  const channel = parsedXml.rss.channel;

  if (
    !(
      typeof channel.title === "string" &&
      channel.title.trim().length > 0 &&
      typeof channel.link === "string" &&
      channel.link.trim().length > 0 &&
      typeof channel.description === "string" &&
      channel.description.trim().length > 0
    )
  ) {
    throw new Error(
      "One or more fields are missing (title, link, description)"
    );
  }

  const title = channel.title.trim();
  const description = channel.description.trim();
  const link = channel.link.trim();

  if (!Array.isArray(channel.item)) {
    channel.item = channel.item ? [channel.item] : [];
  }

  const validItems: any[] = [];
  for (let obj of channel.item) {
    if (
      obj &&
      typeof obj.title === "string" &&
      obj.title.trim().length > 0 &&
      typeof obj.description === "string" &&
      obj.description.trim().length > 0 &&
      typeof obj.link === "string" &&
      obj.link.trim().length > 0 &&
      typeof obj.pubDate === "string" &&
      obj.pubDate.trim().length > 0
    ) {
      validItems.push({
        title: obj.title.trim(),
        description: obj.description.trim(),
        link: obj.link.trim(),
        pubDate: obj.pubDate.trim(),
      });
    }
  }
  channel.item = validItems;

  const rssObj = {
    channel: {
      title: title,
      link: link,
      description: description,
      item: channel.item,
    },
  };
  return rssObj;
}
