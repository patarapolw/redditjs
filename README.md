# redditjs

My Reddit API experiment in TypeScript

## Usage

- Create `./secret.json` with credentials from <https://www.reddit.com/prefs/apps>. See <https://github.com/reddit-archive/reddit/wiki/OAuth2>.

```json
{
  "client_id": "<CLIENT_ID>",
  "client_secret": "<CLIENT_SECRET>",
  "redirect_uri": "<REDIRECT_URI>"
}
```

- Authorize first (i.e. create `./token.json` programmatically) by running `npx ts-node src/authorize.ts`
- Now, do as you please (see `src/index.ts`)
