---
title: Understanding Bloom Filters
author: Vetcha Pankaj Nath
pubDatetime: 2025-01-15T10:00:00Z
description: A deep dive into Bloom filters, their implementation, and real-world use cases in distributed systems.
draft: true
tags: ["data-structures", "algorithms", "systems"]
topics: ["Databases", "Distributed Systems"]
papers: ["Network Applications of Bloom Filters"]
---

A Bloom filter is a space-efficient probabilistic data structure that answers a very specific question: "have I seen this thing before?" - while using almost no memory.

## Why Bloom Filters Matter

There is a trade-off though - bloom filters can be "wrong". A Bloom filter will never tell you something is absent when it is actually present, but it might occasionally claim something exists when it does not.

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

## Implementation

In this note, we explore Bloom filters end-to-end, from fundamental concepts to advanced variants like counting and deletable Bloom filters, the nuances of hash functions, and real-world benchmarks and use-cases.

[Add more content here as you write your notes]
