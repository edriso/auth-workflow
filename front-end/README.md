# Authentication frontend

Requires Node.js 22 or newer. The frontend uses Vite; production output remains in `build`.

- `npm ci` installs the locked dependencies.
- `npm start` starts development at http://localhost:3000.
- `npm run build` builds the production application.
- `npm run preview` serves the production build locally.

The development server forwards `/api` requests to http://localhost:5000. Run the companion server with its documented database and mail configuration for end-to-end authentication.
