const auth = require("./utils/authentication");
const utils = require("../utils");
const PowerBiReportDetails = require("../models/EmbedReportConfig");
const EmbedConfig = require("../models/EmbedConfig");

/**
 * Generate embed token and embed urls for reports
 * @return Details like Embed URL, Access token and Expiry
 */
async function getEmbedInfo() {
  // Get the Report Embed details
  try {
    // Get report details and embed token
    const embedParams = await getEmbedParamsForSingleReport(
      process.env.PBI_WORKSPACE_ID,
      process.env.PBI_REPORT_ID
    );

    return {
      accessToken: embedParams.embedToken.token,
      embedUrl: embedParams.reportsDetail,
      expiry: embedParams.embedToken.expiration,
      status: 200,
    };
  } catch (err) {
    console.log(err);
    return {
      status: err.status,
      error: `Error while retrieving report embed details\r\n${
        err.statusText
      }\r\nRequestId: \n${err.headers.get("requestid")}`,
    };
  }
}

/**
 * Get embed params for a single report for a single workspace
 * @param {string} workspaceId
 * @param {string} reportId
 * @param {string} additionalDatasetId - Optional Parameter
 * @return EmbedConfig object
 */
async function getEmbedParamsForSingleReport(
  workspaceId,
  reportId,
  additionalDatasetId
) {
  const reportInGroupApi = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`;
  const headers = await getRequestHeader();
  //   console.log(headers)

  // Get report info by calling the PowerBI REST API
  const result = await fetch(reportInGroupApi, {
    method: "GET",
    headers: headers,
  });

  if (!result.ok) {
    throw result;
  }

  // Convert result in json to retrieve values
  const resultJson = await result.json();

  // Add report data for embedding
  const reportDetails = new PowerBiReportDetails(
    resultJson.id,
    resultJson.name,
    resultJson.embedUrl
  );
  const reportEmbedConfig = new EmbedConfig();

  // Create mapping for report and Embed URL
  reportEmbedConfig.reportsDetail = [reportDetails];

  // Create list of datasets
  let datasetIds = [resultJson.datasetId];

  // Append additional dataset to the list to achieve dynamic binding later
  if (additionalDatasetId) {
    datasetIds.push(additionalDatasetId);
  }

  // Get Embed token multiple resources
  reportEmbedConfig.embedToken =
    await getEmbedTokenForSingleReportSingleWorkspace(
      reportId,
      datasetIds,
      workspaceId
    );
  return reportEmbedConfig;
}

async function getEmbedTokenForSingleReportSingleWorkspace(
  reportId,
  datasetIds,
  targetWorkspaceId
) {
  // Add report id in the request
  let formData = {
    reports: [
      {
        id: reportId,
      },
    ],
  };

  // Add dataset ids in the request
  formData["datasets"] = [];
  for (const datasetId of datasetIds) {
    formData["datasets"].push({
      id: datasetId,
    });
  }

  // Add targetWorkspace id in the request
  if (targetWorkspaceId) {
    formData["targetWorkspaces"] = [];
    formData["targetWorkspaces"].push({
      id: targetWorkspaceId,
    });
  }

  const embedTokenApi = "https://api.powerbi.com/v1.0/myorg/GenerateToken";
  const headers = await getRequestHeader();

  // Generate Embed token for single report, workspace, and multiple datasets. Refer https://aka.ms/MultiResourceEmbedToken
  const result = await fetch(embedTokenApi, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(formData),
  });

  // console.log(result, "embed token")
  // const rData = await result.json();
  // console.log(rData, "embed token")

  if (!result.ok) throw result;
  return result.json();
}

/**
 * Get Request header
 * @return Request header with Bearer token
 */
async function getRequestHeader() {
  // Store authentication token
  let tokenResponse;

  // Store the error thrown while getting authentication token
  let errorResponse;

  // Get the response from the authentication request
  try {
    tokenResponse = await auth.getAccessToken();
    // console.log(tokenResponse, "token resp")
  } catch (err) {
    if (
      err.hasOwnProperty("error_description") &&
      err.hasOwnProperty("error")
    ) {
      errorResponse = err.error_description;
    } else {
      // Invalid PowerBI Username provided
      errorResponse = err.toString();
    }
    return {
      status: 401,
      error: errorResponse,
    };
  }

  // Extract AccessToken from the response
  const token = tokenResponse.accessToken;
  return {
    "Content-Type": "application/json",
    Authorization: utils.getAuthHeader(token),
  };
}

module.exports = {
  getEmbedInfo: getEmbedInfo,
};
