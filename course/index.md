---
title: AI in the Heartlands
description: A hands-on course that helps everyday people use AI to build things for themselves and their communities.
---

## TL;DR

AI in the Heartlands is a hands-on course brought to you by [Aijutsu](https://aijutsu.dev) with the objective of enabling the everyday person to use AI to build things for themselves and their communities.

We think there's too much intense emotions and misinformation going around what AI can/cannot do, and this results in people either shying away or intentionally staying away from learning AI. We think AI is a tool, just like computers and things like Excel or Word were in the 90s, and we think knowing how to build little tools with AI for friends and family is something that would benefit the community greatly.

And that is why we're doing this.

All materials are open-source and you are free to follow along without paying for the workshops if you'd like. But if you'd like to be guided through these and also meet others like yourself on this journey, our workshop events are priced at very affordable rates with the only pre-requisite that you bring your own ChatGPT subscription.

Three things we'd like you to note:

- Workshop info is available at https://aijutsu.dev/ai-in-the-heartlands
- Course materials can are available on [GitHub](./glossary.md#github) at https://github.com/aijutsu/aith and can be downloaded to run locally if you'd like
- The materials are free for you to learn from. Teaching them or reusing them needs our written approval. See the [Terms of Use](./terms.md)

## Pre-requisites

1. [ChatGPT](./glossary.md#chatgpt) Plus subscription plan and optionally a [Claude](./glossary.md#claude) Pro subscription plan (~$30/month) while you're working through the courses. Claude is not mandatory but we find Claude's Opus model better in terms of debugging/modifying code.
2. A laptop with >= 8GB RAM with full administration privileges (IE no company laptops containing corporate information please, we run many 3rd party software in this course and we not liable for any vulnerabilities in those, you are responsible for what you run)

## Courses overview

1. [Building community agents with NanoClaw](./001-building-agents-with-nanoclaw/index.md)
   1. Introduces a basic developer setup
   2. Introduces the parts of an agent: [model](./glossary.md#model), [harness](./glossary.md#harness), [tool calls](./glossary.md#tool-call) and data, and the [orchestrator](./glossary.md#orchestrator) that runs them
   3. Introduces a basic integration using [Notion](./glossary.md#notion) as a data store
   4. Introduces customising an agent in plain words, and customising [NanoClaw](./glossary.md#nanoclaw) with [skills](./glossary.md#skills)
   5. Introduces rules for agents: data governance, and why data control is harder
1. Building personal websites
    1. Introduces a slightly more advanced developer setup
    1. Introduces plugins to modify harnesses' behaviour for frontend
    1. Introduces basic static deployments with Github, [Cloudflare](./glossary.md#cloudflare), and [Wrangler](./glossary.md#wrangler)
1. Building personal automations
    1. Introduces Routines in Claude/Scheduled Tasks in ChatGPT
    1. Introduces manual harness modifications and indication of preferences
1. Building agentic workflows
    1. Introduces workflow engines via [Trigger.dev](./glossary.md#trigger-dev)
    1. Introduces non-relational [databases](./glossary.md#database) ([MongoDB](./glossary.md#mongodb)) and file storage (Cloudflare R2) for data storage
    1. Introduces [MCP](./glossary.md#mcp) servers as a way to interact with services 
1. Building mini SaaSes
    1. Introduces a full developer setup with `herdr`
    1. Introduces standard deployments via [DigitalOcean](./glossary.md#digitalocean)/Cloudflare
1. Building a homelab
    1. Introduces self-managed infrastructure
    1. Introduces common homelab software
    1. Introduces some security and compliance best-practices
    1. Introduces deploying your own model via [Ollama](./glossary.md#ollama)
1. Deployments, security, compliance, and operations
    1. Introduces Managed Kubernetes on DigitalOcean as a deployment platform
    1. Introduces runbooks

## Glossary

New words used in the course are explained in the [Glossary](./glossary.md).
