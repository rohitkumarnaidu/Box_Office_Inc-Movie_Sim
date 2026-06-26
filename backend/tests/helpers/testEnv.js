// Shared test environment bootstrap.
//
// `src/config/env.js` throws on import unless these variables are set, and the
// Express app (`src/app.js`), the auth middleware, and the token service all
// import it. Any test that imports those must import THIS module *first* so the
// variables exist before `env.js` is evaluated.
//
// ES modules evaluate their imports in source order, so placing
// `import "./helpers/testEnv.js";` as the first import of a test file
// guarantees these are set before anything else loads.
//
// These are throwaway secrets, used only inside the test process.
process.env.JWT_ACCESS_SECRET ||= "test-access-secret-not-for-production";
process.env.JWT_REFRESH_SECRET ||= "test-refresh-secret-not-for-production";
process.env.MONGO_URI ||= "mongodb://127.0.0.1:27017/boxoffice-test";
process.env.CLIENT_URL ||= "http://localhost:5173";
process.env.NODE_ENV ||= "test";
