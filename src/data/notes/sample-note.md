---
title: Understanding Bloom Filters
author: Vetcha Pankaj Nath
pubDatetime: 2025-01-15T10:00:00Z
description: A deep dive into Bloom filters, their implementation, and real-world use cases in distributed systems.
tags: ["data-structures", "algorithms", "systems"]
topics: ["Databases", "Distributed Systems"]
papers: ["Network Applications of Bloom Filters"]
---

# Understanding Bloom Filters

A Bloom filter is a space-efficient probabilistic data structure that answers a very specific question: "have I seen this thing before?" - while using almost no memory.

## Why Bloom Filters Matter

There is a trade-off though - bloom filters can be "wrong". A Bloom filter will never tell you something is absent when it is actually present, but it might occasionally claim something exists when it does not.

## Implementation

In this note, we explore Bloom filters end-to-end, from fundamental concepts to advanced variants like counting and deletable Bloom filters, the nuances of hash functions, and real-world benchmarks and use-cases.

[Add more content here as you write your notes]
