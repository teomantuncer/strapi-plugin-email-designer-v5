import { getFetchClient } from "@strapi/strapi/admin";
import dayjs from "dayjs";
import { pluginName } from "../pluginId";
import { EmailConfig, EmailTemplate } from "../types";


const { post, get, del } = getFetchClient();
/**
 * Date format for displaying dates in the UI
 */
export const DATE_FORMAT = "MMM DD, YYYY [at] h:mmA";

/**
 * Fetches all email templates
 */
export const getTemplatesData = async () => {
  const { data } = await get<EmailTemplate[]>(`/${pluginName}/templates`);
  data.forEach((template) => {
    template.createdAt = dayjs(template.createdAt).format(DATE_FORMAT);
    template.updatedAt = dayjs(template.updatedAt).format(DATE_FORMAT);
  });
  return data;
};

/**
 * Get the editor configuration by the key passed in
 */
export const getEditorConfig = async (key: string = "editor") => {
  const { data } = await get(`/${pluginName}/config/${key}`);
  return data;
};

/**
 * Get the full editor configuration
 */
export const getFullEditorConfig = async () => {
  const { data } = await get<EmailConfig>(`/${pluginName}/config`);
  return data;
};

/**
 * Get the email template by the ID
 */
export const getTemplateById = async (id: string) => {
  const { data } = await get<EmailTemplate>(`/${pluginName}/templates/${id}`);
  return data;
};

/**
 * Get the core email template by the type
 */
export const getCoreTemplate = async (coreEmailType: string) => {
  const { data } = await get<EmailTemplate>(`/${pluginName}/core/${coreEmailType}`);
  return data;
};

/**
 * Create/Update a custom email template
 */
export const createTemplate = async (templateId: string, data: EmailTemplate) => {
  const { data: response } = await post<EmailTemplate>(`/${pluginName}/templates/${templateId}`, data);
  return response;
};

/**
 * Update a core email template
 */
export const updateCoreTemplate = async (coreEmailType: string, data: EmailTemplate) => {
  const { data: response } = await post<EmailTemplate>(`/${pluginName}/core/${coreEmailType}`, data);
  return response;
};

/**
 * Duplicate a custom email template
 */
export const duplicateTemplate = async (id: string) => {
  const { data } = await post<EmailTemplate>(`/${pluginName}/templates/duplicate/${id}`);
  return data;
};

/**
 * Delete a custom email template
 */
export const deleteTemplate = async (id: string) => {
  await del(`/${pluginName}/templates/${id}`);
};

/**
 * Download a based on the ID and the type passed in.
 *
 * This triggers a download of the file.
 */
export const downloadTemplate = async (id: string, type: "html" | "json") => {
  const { data } = await get(`/${pluginName}/download/${id}`, {
    params: { type },
    headers: {
      Accept: 'application/octet-stream',
    }
  });

  // Create a new Blob object using the response data
  const blob = new Blob([data], { type: type === 'json' ? 'application/json' : 'text/html' });

  // Create a URL for the Blob
  const downloadUrl = window.URL.createObjectURL(blob);

  // Create a temporary <a> element to trigger the download
  const link = document.createElement("a");
  link.href = downloadUrl;

  // Set the file name based on the content disposition header or fallback
  const fileName = `template-${id}.${type}`;
  link.setAttribute("download", fileName);

  // Append the link to the body (this is required for some browsers)
  document.body.appendChild(link);

  // Programmatically click the link to trigger the download
  link.click();

  // Clean up and remove the link after the download is triggered
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
