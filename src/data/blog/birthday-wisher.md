---
author: Pankaj
pubDatetime: 2026-01-13T18:07:46.000+05:30
modDatetime: 
title: Birthday Wisher
featured: true
draft: false
tags:
    - Birthday
    - Automation
description: Never Miss a Birthday Again, Building a Lightweight WhatsApp Bot with Node.js & Systemd
---

I keep forgetting birthdays (most of us have this issue, I guess). I wanted a solution that was automated and free (obviously, I am not going to pay for this).

While looking around, you’ll notice a pattern in many “WhatsApp automation” GitHub repos: they spin up a full browser using Selenium/Puppeteer/Playwright, open WhatsApp Web, and click UI elements. That works, but it’s also the kind of thing that breaks the moment WhatsApp changes a selector, plus it feels unnecessarily heavy for something that should quietly run once a day.

The fun part of this build was discovering a cleaner approach and wiring the whole thing end‑to‑end: WhatsApp connectivity → birthday logic → monitoring → scheduling on Arch


## 1. The discovery: Baileys

The big turning point is [Baileys](https://github.com/WhiskeySockets/Baileys). It’s a TypeScript/JavaScript library that implements the WhatsApp Web protocol so your script can connect without launching a browser window.

Why it’s a win for personal automation:
- Low resource usage (no Chrome sitting in RAM).
- Runs fully headless (terminal-only).
- Saves auth state locally, so QR scan is usually a one-time thing.


## 2. The Setup

Initialize a Node.js project and install the needed packages:
```bash
mkdir whatsapp-birthday-bot
npm init -y
npm install @whiskeysockets/baileys qrcode-terminal pino
```

Next, create a simple `birthdays.json` database in the root folder. This is where you store the dates:
```json
[
  { "name": "Rahul", "phone": "919876543210", "date": "01-14" },
  { "name": "Mom", "phone": "918765432100", "date": "05-20" }
]
```

## 3. Bot logic + “self-report” monitoring

The script connects to WhatsApp, checks the date, and sends messages. 

However, I realized I needed to know if the bot was actually running. If it fails silently, I’m back to forgetting birthdays. I added a **Daily Report** feature that sends *me* a message every time it runs.

Also, one important learning: Baileys uses a persistent WebSocket connection, so if you don’t explicitly exit, the process will just keep running (even after “Sent!”). For a scheduled job, you want it to send and exit.

Here is the core logic in `index.js`:

```javascript
async function checkBirthdaysAndSend(sock) {
    const today = new Date();
    // Format Month-Day (e.g., 01-14)
    const dateString = String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    
    let wishedList = [];

    // Check matches
    for (const person of birthdays) {
        if (person.date === dateString) {
            await sock.sendMessage(person.phone + "@s.whatsapp.net", { text: `Happy Birthday ${person.name}! 🎂` });
            wishedList.push(person.name);
        }
    }

    // Send Daily Report to Myself
    const myJid = jidNormalizedUser(sock.user.id);
    const statusMsg = wishedList.length > 0 
        ? `✅ Sent wishes to: ${wishedList.join(", ")}` 
        : `🤖 System Active. No birthdays today (${dateString}).`;

    await sock.sendMessage(myJid, { text: statusMsg });
    
    // IMPORTANT: Kill the process so the cron/systemd job finishes
    setTimeout(() => process.exit(0), 2000);
}
```

## 4. Scheduling on Arch: systemd user timer

Since I am running Omarchy Linux (an Arch-based distro), I decided to use systemd timers. On modern Arch-based systems, systemd timers are the clean way to schedule recurring tasks. They integrate nicely with logs (journalctl) and let you declare dependencies (like waiting for the network).

This setup uses user units (no root required):
- birthday-bot.service → what to run.
- birthday-bot.timer → when to run.

Create the systemd user directory

```bash
mkdir -p ~/.config/systemd/user
```

Create the service file

```bash
nano ~/.config/systemd/user/birthday-bot.service
```

Paste (update WorkingDirectory and Node path):

```ini
[Unit]
Description=WhatsApp Birthday Bot Service
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
WorkingDirectory=/home/yourusername/Projects/birthday-bot
ExecStart=/usr/bin/node index.js
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target
```

Create the timer file

```bash
nano ~/.config/systemd/user/birthday-bot.timer
```

Paste:

```ini
[Unit]
Description=Daily Timer for WhatsApp Birthday Bot

[Timer]
OnCalendar=*-*-* 00:05:00
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
```

Enable + start

Reload systemd and enable the timer:

```bash
systemctl --user daemon-reload
systemctl --user enable --now birthday-bot.timer

Confirm the next run time:

```bash
systemctl --user list-timers --all | grep birthday
```

## 5. Testing & debugging (the practical part)
Manually run the service (no waiting till midnight)

This is the fastest way to verify everything works:

```bash
systemctl --user start birthday-bot.service
```

Check logs using journalctl

Since the service writes logs to the journal, you can view them like this:

```bash
journalctl --user -u birthday-bot.service
```

## 6. Make it run even when you’re logged out (enable linger)

User services often stop when you log out. To keep the timer effective even without an active login session, enable linger:

```bash
loginctl enable-linger $USER
```

Verify it with:

```bash
loginctl show-user $USER --property=Linger

Expected output:

```ini
Linger=yes
```

If you see below output then you can be happy 😁.

```ini
Linger=yes
```
## Outcome

Now, every night at 12:05 AM:
1.  Systemd wakes up the timer.
2.  Node.js starts, Baileys connects to WhatsApp via WebSocket.
3.  Birthdays are checked.
4.  Wishes are sent.
5.  **I get a notification from myself** confirming the system worked.
6.  The process kills itself to save resources.

It was a fun build.


            
             
            
