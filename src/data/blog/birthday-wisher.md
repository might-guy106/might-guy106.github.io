---
author: Pankaj
pubDatetime: 2026-01-13T18:07:46.000+05:30
modDatetime: 
title: Birthday Wisher
featured: false
draft: false
tags:
    - Birthday
    - Automation
description: Never Miss a Birthday Again: Building a Lightweight WhatsApp Bot with Node.js & Systemd
---

I have a recurring problem: I keep forgetting birthdays (most of us have this issue i guess). I wanted a solution that was automated and free (obviously i am not going pay for this). 

I looked at existing GitHub projects, but most were essentially scripts that opened a web browser (using Selenium), scanned the QR code visually, and clicked buttons. That felt "heavy" and brittle. I didn't want a Chrome window popping up on my laptop every midnight.

I wanted something that ran silently in the background on my Arch Linux setup. Here is how I built a lightweight Birthday Bot using **Node.js**, **Baileys**, and **Systemd**.

## 1. The Right Tool: Finding Baileys

I stumbled upon a library called [Baileys](https://github.com/WhiskeySockets/Baileys). Unlike Selenium, Baileys doesn't need a browser. It reverse-engineered the WhatsApp Web WebSocket protocol.

This means:
1.  **Low Resource Usage:** No Chrome/Firefox instances.
2.  **Headless:** Runs entirely in the terminal.
3.  **State Management:** It saves the session to a local folder, so I only scan the QR code once.

## 2. The Setup

I initialized a simple Node.js project:

```bash
mkdir whatsapp-birthday-bot
npm init -y
npm install @whiskeysockets/baileys qrcode-terminal pino
```

I created a simple `birthdays.json` database:

```json
[
  { "name": "Rahul", "phone": "919876543210", "date": "01-14" },
  { "name": "Mom", "phone": "918765432100", "date": "05-20" }
]
```

## 3. The Logic (and the "Self-Ping")

The script connects to WhatsApp, checks the date, and sends messages. 

However, I realized I needed to know if the bot was actually running. If it fails silently, I’m back to forgetting birthdays. I added a **Daily Report** feature that sends *me* a message every time it runs.

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

## 4. Automation: The "Arch" Way

Since I use **Omarchy Linux**, I used **Systemd Timers** instead of `cron`. Systemd is more robust for handling logs and dependencies (like waiting for the network to be online).

I created a **User Service** so I didn't have to run it as root.

### The Service (`~/.config/systemd/user/birthday-bot.service`)
This defines *what* to run. Note the `Type=oneshot` because the script runs once and exits.

```ini
[Unit]
Description=WhatsApp Birthday Bot Service
After=network-online.target

[Service]
Type=oneshot
WorkingDirectory=/home/pankaj/Projects/whatsapp-birthday-bot
ExecStart=/usr/bin/node index.js
StandardOutput=journal
```

### The Timer (`~/.config/systemd/user/birthday-bot.timer`)
This defines *when* to run (Daily at 12:05 AM).

```ini
[Unit]
Description=Daily Timer for WhatsApp Birthday Bot

[Timer]
OnCalendar=*-*-* 00:05:00
Persistent=true
# RandomizedDelaySec=300

[Install]
WantedBy=timers.target
```

## 5. The Final Trick: Enabling "Linger"

Systemd user services usually die when you logout. To ensure the bot runs even if I'm not actively logged into a GUI session (but the laptop is on), I enabled lingering:

```bash
loginctl enable-linger $USER
```

I verified it with `ls /var/lib/systemd/linger/`, seeing my username listed.

## Outcome

Now, every night at 12:05 AM:
1.  Systemd wakes up the timer.
2.  Node.js starts, Baileys connects to WhatsApp via WebSocket.
3.  Birthdays are checked.
4.  Wishes are sent.
5.  **I get a notification from myself** confirming the system worked.
6.  The process kills itself to save resources.

It was a fun weekend build that solved a real life problem using modern Linux tools!


            
             
            
