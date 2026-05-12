# StereoTales Human Study

Survey app for collecting participant ratings on demographic associations found in AI-generated text. For each association, participants answer two questions: whether it reinforces a harmful stereotype (5-point Likert), and whether it reflects a real-world pattern (yes/no/I don't know). Built with Next.js, Neon (serverless Postgres), and Tailwind CSS.

## Prerequisites

- Node.js 20+
- Database: [Neon](https://neon.tech)
- Deployment via [Cloudflare](https://cloudflare.com)

## Dev Setup

```
make build && make dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `API_KEY` | Secret key for the `/api/export` endpoint |
| `REDIRECT_URL` | Where to send participants after completion (provided by Prolific) |
| `STUDY_ACCESS_TOKEN` | Token required in participant URLs to restrict access |
| `STUDY_VERSION` | Semantic version of the study content (e.g. `1.0.0`). Saved with each participant's answers. |
| `ATTENTION_CHECK_INTERVAL` | Number of regular questions between each attention check. Defaults to `3`. |

The schema is created automatically on the first request (`participants` and `answers` tables).

## Participant URL

```
https://your-host/?participant_id=PARTICIPANT_ID&token=STUDY_ACCESS_TOKEN
```

Requests without a valid `token` get a 403 page.

## Database — Neon

[Neon](https://neon.tech) is a serverless Postgres provider. Its HTTP-based driver works in both Node.js and edge/Cloudflare runtimes without a persistent connection.

## Deployment — Cloudflare Pages

The app uses [`@opennextjs/cloudflare`](https://github.com/opennextjs/opennextjs-cloudflare) to run Next.js on Cloudflare Pages.

CloudFlare automation should be enabled on the repository, so the app is automatically deployed to Cloudflare Pages.

## Export Data

An API endpoint is available to export all the answers from the DB. 
```bash
curl -H "X-API-Key: YOUR_API_KEY" https://your-host/api/export
```

## Associations input format
The associations are stored in the `data/questions.json` file. They should contain the list of associations to be evaluated by the human participants.
The file is a JSON array with the following structure:
```json
{
  "question_id": "string",
  "association_percentage": "number",
  "base_attribute": {
    "name": "string",
    "value": "string"
  },
  "compared_attribute": {
    "name": "string",
    "value": "string"
  },
  "metadata": {
    "model_list": ["model1", "model2", "model3"]
  }
}
```

## Database migration
After schema changes, run the migration against your target database:
```bash
make migrate
```
This is idempotent and safe to re-run.
