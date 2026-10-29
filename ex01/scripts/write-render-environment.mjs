import { writeFile } from "node:fs/promises";

const configuredHost = process.env.API_HOST;
if (!configuredHost) {
	throw new Error("Render must provide API_HOST to build the Angular application.");
}

const apiHost = configuredHost.replace(/^https?:\/\//, "").replace(/\/+$/, "");
const parsedHost = new URL(`https://${apiHost}`);
if (parsedHost.pathname !== "/" || parsedHost.search || parsedHost.hash) {
	throw new Error("API_HOST must contain only the API hostname.");
}

const environment = `export const environment = {
\tapiUrl: 'https://${parsedHost.host}/api',
\tpollutionStorage: 'api',
\tproduction: true,
} as const;
`;

await writeFile(
	new URL("../src/environments/environment.render.ts", import.meta.url),
	environment,
	"utf8",
);
