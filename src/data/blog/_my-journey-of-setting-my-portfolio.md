---
author: Pankaj Nath
pubDatetime: 2025-12-24T22:51:05.000+05:30
modDatetime: 
title: My Journey of Setting Up Personal Portfolio
featured: false
draft: false
tags:
  - portfolio
  - astro
  - github-pages
description: A step-by-step guide on how I built my personal portfolio using AstroPaper and hosted it on GitHub Pages with a custom domain.
---

Setting up my own personal portfolio had been on my TODO list for a long time. In this post, I'll walk you through my journey of building and hosting my portfolio, from buying a domain to automated deployments with GitHub Actions. hopefully this feels like a walkthrough from a friend rather than a tutorial page.

<!-- ## Table of Contents -->

## 1. Registering the Custom Domain

My full name is `Vetcha Pankaj Nath`, so I was pretty sure I wanted my domain to contain pankaj in some form, I considered a few options:

- `vpankaj`
- `pankajnath`

Then came the TLD decision. I checked quite a few:

- `.com`
- `.dev`
- `.net`
- `.xyz`
- `.in`

Some of them were cheaper, I checked various registrars like NameCheap and GoDaddy, but I found that while their first-year prices were low, renewal costs were often high as compared to **Spaceship** and **Cloudflare**.

Ultimately, I secured `vpankaj.com` via Spaceship. Using coupon code `COM67`, I got it for around 6$ for the first year, with a reasonable renewal rate of ~10$/year. Cloudflare offered At-cost domain registration and renewal, which is also a great option.

## 2. Deciding how I wanted my website to work

Once the domain was done, the next question was:

> What kind of website do I even want?

using a heavy SPA felt unnecessary. I decided to go with a static site, where pages are generated ahead of time and served as plain HTML. I Chose Astro as my framework because

- It’s static-first
- Minimal JavaScript by default
- Markdown support is excellent

## 3. Choosing a Hosting Provider

I needed a place to host my static site. I evaluated the popular contenders:

*   **Netlify:** Famous for ease of use and a generous free tier (100GB bandwidth). Great features like form handling.
*   **Vercel:** The creators of Next.js. Excellent for static sites with a focus on speed and global CDN.
*   **GitHub Pages:** Completely free, simple, and built directly into my code repository.
*   **Cloudflare Pages:** Secure and fast, running on Cloudflare's massive network.

I didn’t need previews or complex serverless features. I just wanted something simple and reliable, so I went with GitHub Pages. It’s free and tightly integrated with GitHub.

## 4. Configuring DNS

To point my custom domain (`vpankaj.com`) to GitHub Pages, I needed to configure the DNS records in my domain registrar's Advanced DNS dashboard (Spaceship).

I added **four A records** to point the root domain (`@`) to GitHub's server IPs:

| Type | Host | Value | TTL |
| :--- | :--- | :--- | :--- |
| A | @ | 185.199.108.153 | 30 min |
| A | @ | 185.199.109.153 | 30 min |
| A | @ | 185.199.110.153 | 30 min |
| A | @ | 185.199.111.153 | 30 min |

I also added a **CNAME record** for the `www` subdomain to alias it to my root domain:

| Type | Host | Value | TTL |
| :--- | :--- | :--- | :--- |
| CNAME | www | vpankaj.com | 30 min |

> **Note:** The multiple A records ensure redundancy. GitHub uses the `Host` header in incoming requests to route traffic to the correct repository, even though everyone points to the same IP addresses. [Read more about GitHub Pages DNS configuration](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## 5. Setting up the Astro Project

I liked the AstroPaper theme, so I used it as a starting point.

### Step 1: Initialize the Project

Run the following command to scaffold the project using the AstroPaper template:

```bash
# This command pulls the specific AstroPaper template
npm create astro@latest -- --template satnaing/astro-paper
```

Follow the interactive prompts to complete the setup.

### Step 2: Configure the Site

Update the `src/config.ts` file to reflect your personal details. This is crucial for SEO and metadata.

```ts
export const SITE = {
  website: "https://vpankaj.com/", // IMPORTANT: Replace with your domain
  author: "Vetcha Pankaj Nath",
  profile: "https://vpankaj.com/",
  desc: "Personal portfolio and blog of Vetcha Pankaj Nath, a Full Stack Developer specializing in Python and C++.",
  title: "V Pankaj",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  // ... other settings
};
```

## 6. Setting up GitHub Repository

I created a specific repository on GitHub named: **`might-guy106.github.io`**.

> **Why this name?**
> Naming your repository `username.github.io` allows your site to be served from the root URL (`https://username.github.io`) rather than a subpath (`https://username.github.io/project-name`).

### Push the Code

Initialize Git and push your fresh Astro project to this repository:

```bash
git init
git add .
git commit -m "Initial portfolio setup"

# Link to your GitHub repo
git remote add origin https://github.com/YOUR-USERNAME/YOUR-USERNAME.github.io.git
git branch -M main
git push -u origin main
```

## 7. Automating Deployments with GitHub Actions

To automatically build and deploy the site whenever I push code, I set up a GitHub Action.

1.  Create a directory structure in your project root: `.github/workflows/`
2.  Create a file named `deploy.yml` inside it:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v4
      - name: Install, build, and upload your site
        uses: withastro/action@v2
        with:
            package-manager: npm

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### The CNAME File

Since we are using a custom domain, we need to tell GitHub Pages about it. Create a `CNAME` file in the `public/` directory.

```bash
echo "vpankaj.com" > public/CNAME
```

When Astro builds your site, it copies files from `public/` directly to the `dist/` folder. This ensures the `CNAME` file exists in the deployment, allowing GitHub to map `vpankaj.com` to your site correctly. 

## 7. Final Configuration

1.  Go to your repository **Settings** on GitHub.
2.  Navigate to the **Pages** section on the left sidebar.
3.  Under **Build and deployment**, select **GitHub Actions** as the source.
4.  Under **Custom domain**, enter `vpankaj.com` and save.
5.  Wait for the DNS check to pass, then check the box for **Enforce HTTPS**.

And that's it! Now, every time I push changes to the `main` branch, my GitHub Action builds the Astro site and deploys it live to my custom domain.
