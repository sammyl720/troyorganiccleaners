# Troy Organic Cleaners CMS

The public website stays plain HTML/CSS/JavaScript. `admin/` is a separate Vite, React, TypeScript application. Supabase provides authentication and the database; there is no application server.

## Development

Use Node 22.12+ (Node 24 LTS recommended), npm, Docker, and a recent Supabase CLI.

```sh
npm ci
npm ci --prefix admin
cp admin/.env.example admin/.env.local
npm run dev:admin
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `admin/.env.local`. Open `/admin/login` on the Vite development server. Only `sb_publishable_…` keys are accepted by browser configuration. Legacy local CLI installations that only issue JWT keys must be upgraded to use the browser app against the local stack.

For the public site, serve the repository with any static HTTP server (for example `python3 -m http.server 8080`). Set the same public project URL/key in `js/config.js`. Empty configuration intentionally keeps the existing website working without CMS requests. Do not put a service-role key, secret key, or database password in either configuration file.

```sh
supabase start
supabase db reset
npm run test:db
npm test
npm run test:browser
npm run build
```

`supabase db reset` deletes and recreates the **local** development database. Never use it against a production project. Browser tests use installed Google Chrome and mock Supabase HTTP responses; the pgTAP suite exercises actual PostgreSQL grants, RLS, and constraints. Browser mocks are not a substitute for database tests.

## Production setup

1. Create/select a Supabase project. In Authentication settings, disable **Allow new users to sign up**, enable email/password sign-in, and configure the production site URL. The local `supabase/config.toml` does not configure hosted Auth settings.
2. Apply `supabase/migrations/001_initial_cms.sql` using the SQL editor, or link the Supabase CLI and run `supabase db push`. Then run `supabase/seed.sql` using the SQL editor. `db push` does not automatically run this seed file. Seeds are repeat-safe and never overwrite existing content.
3. In Authentication → Users, manually create an administrator with a strong password. Copy that user's UUID and run the following in the SQL editor, substituting the real UUID:

   ```sql
   insert into public.admin_users(user_id)
   values ('REPLACE-WITH-AUTH-USER-UUID');
   ```

   Remove access with `delete from public.admin_users where user_id = 'UUID';`. Browser users, including CMS admins, cannot modify this allowlist. Use the Supabase dashboard to reset forgotten passwords; the CMS has no signup or password-reset workflow.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Netlify's build environment. `netlify.toml` installs both packages, builds the admin, and publishes `dist/`. The build writes the same public configuration into the static site's `js/config.js`.
5. Deploy and open `/admin/login`. The `/admin/*` rewrite serves the admin entry point on direct visits and refreshes. The public site's root stays static. For another host, publish `dist/` and add an equivalent rewrite limited to `/admin/*`.
6. Sign in and change Monday's closing time, add a real service price, and enable/disable a banner. Refresh the public website after each save. Verify those changes without rebuilding. Also test a logged-in non-admin account, anonymous write rejection, and blocked Supabase/CDN requests in the production browser.

Do not run the test fixtures against production. Validate RLS on a local or staging database before deployment. The hosted project `yonpmebxbpmyowjfqpyz` has been initialized with this schema and seed. Public signup is disabled. The public URL/key are configured in `js/config.js` and `netlify.toml`; no secret keys are committed. Production website deployment is a separate step.

## Behavior and security

- Explicit PostgreSQL grants and separate SELECT/INSERT/UPDATE/DELETE policies protect all five CMS tables. `admin_users` only exposes a caller's own membership. The real access boundary is RLS, not React routing. See [Supabase's RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).
- Visitors see weekly hours, active services in active categories (plus uncategorized active services), active categories, and an enabled banner. Draft banner content and inactive rows are admin-only.
- Hours save in a single atomic upsert. Closed days store null times. Overnight hours are outside this MVP; closing must follow opening on the same day.
- Prices require a nonnegative amount except “Call for quote,” which requires a null price. The existing site has no published prices, so sample dollar amounts from the brief are not seeded. Add actual prices in the CMS.
- Category order sorts public pricing groups; service order sorts entries within each group. Deleting a category makes its services uncategorized and can make active services public; the UI explains this before deletion.
- Banner links must use HTTP(S), with both label and URL provided. Banner HTML is rejected. All CMS data is rendered using text/DOM APIs or React escaping.
- Static hours render immediately. `js/cms.js` waits for the existing JSON renderer before updating hours, preventing a race. A timeout bounds that legacy request. Partial or failed CMS reads leave fallback content intact. Services and banner fail independently. Structured opening hours update alongside visible hours.
- Content loads once per page view. There is no polling, Realtime, audit system, or holiday-hours table.
- Authentication/session tokens are managed by Supabase JS. Membership is checked at startup and auth changes; revoking membership immediately blocks subsequent database requests via RLS.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev:admin` | Admin development server |
| `npm test` | Public DOM/fallback tests and Zod validation tests |
| `npm run test:browser` | Admin login, access denial, editing, errors, mobile layout, sign out |
| `npm run test:db` | PostgreSQL security and integrity tests |
| `npm run build:admin` | Typecheck and bundle only the admin |
| `npm run build` | Assemble the deployable static site and admin in `dist/` |

The static source can still be deployed independently without building React. To deploy the admin separately, place its build at `/admin/` and configure the corresponding route fallback.
