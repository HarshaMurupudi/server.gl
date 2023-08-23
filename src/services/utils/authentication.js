
const getAccessToken = async function () {
    // Create a config variable that store credentials from config.json

    // Use MSAL.js for authentication
    const msal = require("@azure/msal-node");

    const msalConfig = {
        auth: {
            clientId: process.env.PBI_CLIENT_ID,
            // clientSecret: process.env.PBI_CLIENT_SECRET,
            authority: `${process.env.PBI_AUTHORITY_URL}${process.env.PBI_TENANT_ID}`,
        }
    };

    // Check for the MasterUser Authentication
    if (process.env.PBI_AUTHENTICATION_MODE.toLowerCase() === "masteruser") {
        const clientApplication = new msal.PublicClientApplication(msalConfig);

        const usernamePasswordRequest = {
            scopes: [process.env.PBI_SCOPE_BASE],
            username: process.env.PBI_USERNAME,
            password: process.env.PBI_PASSWORD
        };

        return clientApplication.acquireTokenByUsernamePassword(usernamePasswordRequest);

    };

    // Service Principal auth is the recommended by Microsoft to achieve App Owns Data Power BI embedding
    if (process.env.PBI_AUTHENTICATION_MODE.toLowerCase() === "serviceprincipal") {
        msalConfig.auth.clientSecret =  process.env.PBI_CLIENT_SECRET
        const clientApplication = new msal.ConfidentialClientApplication(msalConfig);

        const clientCredentialRequest = {
            scopes: [process.env.PBI_SCOPE_BASE],
        };

        return clientApplication.acquireTokenByClientCredential(clientCredentialRequest);
    }
}

module.exports.getAccessToken = getAccessToken;