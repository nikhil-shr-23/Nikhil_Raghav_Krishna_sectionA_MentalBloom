# MentalBloom Frontend

This is the frontend for the MentalBloom application, built with Next.js and Shadcn UI.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

- User authentication (login/register)
- Chat interface with AI assistant
- Mental health resources
- Responsive design

## Project Structure

- `app/` - Next.js app directory
  - `(auth)/` - Authentication pages (login, register)
  - `(dashboard)/` - Dashboard pages (chat, resources)
  - `page.tsx` - Home page
- `components/` - Reusable UI components
- `lib/` - Utility functions and API services
- `public/` - Static assets

## Technologies Used

- Next.js - React framework
- Shadcn UI - Component library
- Tailwind CSS - Utility-first CSS framework
- TypeScript - Type-safe JavaScript

## Docker

You can also run the frontend using Docker:

```bash
docker build -t mentalbloom-frontend .
docker run -p 3000:3000 mentalbloom-frontend
```

Or use docker-compose to run the entire application stack:

```bash
docker-compose up
```
