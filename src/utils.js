// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------
import { validate as uuidValidate } from 'uuid';

function getAuthHeader(accessToken) {
  // Function to append Bearer against the Access Token
  return "Bearer ".concat(accessToken);
}

function validateConfig() {
  // Validation function to check whether the Configurations are available in the config.json file or not

  // let uuid = require("uuid");

  if (!process.env.PBI_AUTHENTICATION_MODE) {
    return "AuthenticationMode is empty. Please choose MasterUser or ServicePrincipal in config.json.";
  }

  if (
    process.env.PBI_AUTHENTICATION_MODE.toLowerCase() !== "masteruser" &&
    process.env.PBI_AUTHENTICATION_MODE.toLowerCase() !== "serviceprincipal"
  ) {
    return "AuthenticationMode is wrong. Please choose MasterUser or ServicePrincipal in config.json";
  }

  if (!process.env.PBI_CLIENT_ID) {
    return "ClientId is empty. Please register your application as Native app in https://dev.powerbi.com/apps and fill Client Id in config.json.";
  }

  if (!uuidValidate(process.env.PBI_CLIENT_ID)) {
    return "ClientId must be a Guid object. Please register your application as Native app in https://dev.powerbi.com/apps and fill Client Id in config.json.";
  }

  if (!process.env.PBI_REPORT_ID) {
    return "ReportId is empty. Please select a report you own and fill its Id in config.json.";
  }

  if (!uuidValidate(process.env.PBI_REPORT_ID)) {
    return "ReportId must be a Guid object. Please select a report you own and fill its Id in config.json.";
  }

  if (!process.env.PBI_WORKSPACE_ID) {
    return "WorkspaceId is empty. Please select a group you own and fill its Id in config.json.";
  }

  if (!uuidValidate(process.env.PBI_WORKSPACE_ID)) {
    return "WorkspaceId must be a Guid object. Please select a workspace you own and fill its Id in config.json.";
  }

  if (!process.env.PBI_AUTHORITY_URL) {
    return "AuthorityUrl is empty. Please fill valid AuthorityUrl in config.json.";
  }

  if (process.env.PBI_AUTHENTICATION_MODE.toLowerCase() === "masteruser") {
    if (!process.env.PBI_USERNAME || !process.env.PBI_USERNAME.trim()) {
      return "PbiUsername is empty. Please fill Power BI username in config.json.";
    }

    if (!process.env.PBI_PASSWORD || !process.env.PBI_PASSWORD.trim()) {
      return "PbiPassword is empty. Please fill password of Power BI username in config.json.";
    }
  } else if (
    process.env.PBI_AUTHENTICATION_MODE.toLowerCase() === "serviceprincipal"
  ) {
    if (
      !process.env.PBI_CLIENT_SECRET ||
      !process.env.PBI_CLIENT_SECRET.trim()
    ) {
      return "ClientSecret is empty. Please fill Power BI ServicePrincipal ClientSecret in config.json.";
    }

    if (!process.env.PBI_TENANT_ID) {
      return "TenantId is empty. Please fill the TenantId in config.json.";
    }

    if (!uuidValidate(process.env.PBI_TENANT_ID)) {
      return "TenantId must be a Guid object. Please select a workspace you own and fill its Id in config.json.";
    }
  }
}

const upsert = async (model, condition, values) => {
  const obj = await model.findOne({
    where: condition,
  });
  if (obj) {
    return obj.update(values);
  }
  return model.create({ ...condition, ...values });
};


module.exports = {
  getAuthHeader: getAuthHeader,
  validateConfig: validateConfig,
  upsert,
};
