Tech Stack (Temp)
 - Next.js
 - Supabase (DB + Realtime)
 - Tailwind CSS
 - Hack Club Auth

 TODO
 - Add ability to add users manually, and private channels 
 - Add user edit page
 - Add DMs
 - Add activity
 - Add video call feature

Ideas for dev functionality
1. After a new bot is created and subscribed to a channel to read new messages
2. in a new folder, make a js file that reads to all insert postgres events in messages tables
3. it finds the bots that have subscribed to that particular channel, and then clicks the webhook url of all of them
4. a rough code

await Promise.allSettled(
  hooks.map(hook =>
    fetch(hook.webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-SlackClone-Signature": hook.secret,
      },
      body: JSON.stringify(message),
    })
  )
);
