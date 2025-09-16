import configJson from "./auth_config.json";

/**
 * Build and return Auth0 client configuration from auth_config.json.
 *
 * Reads domain and clientId directly from the imported JSON and includes an optional
 * audience only if configJson.audience is present and not equal to the placeholder
 * "YOUR_API_IDENTIFIER" (otherwise the audience property is omitted).
 *
 * @returns {{domain: string, clientId: string, audience?: string}} The configuration object for initializing Auth0.
 */
export function getConfig() {
  // Configure the audience here. By default, it will take whatever is in the config
  // (specified by the `audience` key) unless it's the default value of "YOUR_API_IDENTIFIER" (which
  // is what you get sometimes by using the Auth0 sample download tool from the quickstart page, if you
  // don't have an API).
  // If this resolves to `null`, the API page changes to show some helpful info about what to do
  // with the audience.
  const audience =
    configJson.audience && configJson.audience !== "YOUR_API_IDENTIFIER"
      ? configJson.audience
      : null;

  return {
    domain: configJson.domain,
    clientId: configJson.clientId,
    ...(audience ? { audience } : null),
  };
}
