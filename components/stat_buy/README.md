This page demonstrates server-side data fetching using `getServerSideProps`.
- Preloads `get_all` API data on the server via /server/api.js `getDataSSR`
- Handles cookie-based login instead of client's localStorage
- Provides automatic redirects for unauthorized users
- Can Fallback to client-side get_all fetching if SSR fails

This is for demonstration purposes and does not replace existing client-side logic.
