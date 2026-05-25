# Florentin

Next.js SaaS prototype for generating AI graffiti walls and premium process videos.

## Local run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## What is implemented

- Email login flow for development and real Google OAuth registration/login with a signed session cookie.
- 3 free credits for new users.
- Image generation flow with upload, 32-color palette, style, wall type and add-ons.
- Paywall at zero credits.
- Lemon Squeezy checkout route for the paid credit pack.
- Premium video generation gate.
- Browser-rendered process video preview with downloadable WebM.
- Server API routes for session, image, video, checkout and Lemon Squeezy webhook.

## Google OAuth

Create OAuth credentials in Google Cloud and add these redirect URLs:

```text
http://localhost:3000/api/auth/callback/google
https://florentini.netlify.app/api/auth/callback/google
https://your-domain.com/api/auth/callback/google
```

Required environment variables:

```bash
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=
```

`AUTH_SECRET` signs the `florentin_session` cookie. In production, set it to a long random value.

## Lemon Squeezy

Create a `.env.local` file from `.env.example` and add your Lemon Squeezy values.

The checkout route redirects to `LS_CHECKOUT_URL` when Checkout API keys are not configured. If `LS_API_KEY`, `LS_STORE_ID` and `LS_VARIANT_ID` are present, it uses Lemon Squeezy's Checkout API and passes the app user email, user id and credit amount via `checkout_data.custom`.

Configure the Lemon Squeezy variant itself at `$5`. The app grants 15 credits for this pack. Image generation costs 1 credit. Video generation costs 5 credits, so one pack covers 15 images or 10 images plus 1 video.

Required environment variables:

```bash
LS_CHECKOUT_URL=
LS_API_KEY=
LS_STORE_ID=
LS_VARIANT_ID=
LS_WEBHOOK_SECRET=
```

The webhook verifies the `X-Signature` HMAC SHA-256 header with `LS_WEBHOOK_SECRET` using `crypto.timingSafeEqual` before parsing or processing the payload. On `order_created`, it calls `updateUserCredits(email, amount)`, which applies a `$inc`-style credit increment.

Required dashboard webhook URL:

```text
https://your-domain.com/api/lemonsqueezy/webhook
```

## AI providers

Image generation uses Gemini Image through the Gemini API. Set `GEMINI_API_KEY` and optionally `GEMINI_IMAGE_MODEL`.

Default image model:

```bash
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image-preview
GEMINI_IMAGE_SIZE=1K
```

The image route sends the uploaded user photo as inline base64 image data plus the Florentin graffiti prompt to Gemini. For older Nano Banana, set `GEMINI_IMAGE_MODEL=gemini-2.5-flash-image`; the app automatically omits `GEMINI_IMAGE_SIZE` for that model because it only supports aspect ratio. Video generation is still a local downloadable preview until the final Gemini/Veo video endpoint is connected.
