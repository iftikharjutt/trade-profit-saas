# Trade Profit SaaS - Production Upgrade Plan

## Overview
This document outlines the architectural changes made to transform the prototype into a production-grade fintech SaaS.

### Phase 1: Deep Code Review
- **Issue**: Flat trade structure. **Fix**: Migrated to a Portfolio-based hierarchy.
- **Issue**: Scalability. **Fix**: Implemented cursor-based pagination and modular services.
- **Issue**: Monetization. **Fix**: Integrated Stripe Billing and feature-gating middleware.

### Phase 2: Core System Design
- **Database**: PostgreSQL with Prisma. Added `Portfolio` and `Subscription` models.
- **API**: RESTful API with modular routes and controllers.
- **Services**: Business logic moved to specialized services (e.g., `profitEngine.ts`, `StripeService`).

### Phase 3: Trading Engine (Mathematically Correct)
- Support for **Leverage** and **Fees**.
- **Risk Metrics**: Added R-Multiple and Drawdown calculations.
- **Directional Logic**: Handles Long and Short positions correctly using margin math.

### Phase 4: Analytics Dashboard
- **Visuals**: Recharts integration for Equity Curves.
- **KPIs**: Win Rate, Avg ROI, Max Drawdown, Total Net Profit.
- **AI Insights**: Integrated (mocked) strategy insights for traders.

### Phase 5: SaaS Business Layer
- **Auth**: JWT-based authentication.
- **Monetization**: Stripe Checkout and Webhooks.
- **Feature Gating**: Middleware to restrict premium analytics to Pro users.

## Deployment Guide
1. **Database**: `npx prisma migrate dev` to update the schema.
2. **Backend**: `npm run build` in `/server`. Set `STRIPE_SECRET_KEY`.
3. **Frontend**: `npm run build` in `/client-next`.
4. **Environment**: Ensure all variables in `.env.example` are populated.
