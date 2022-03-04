import { Gitlab, Types } from "@gitbeaker/node";
import config from "../config/config";
import { getEnvVar } from "../util/env";

const api = new Gitlab({
  host: config.gitlab.host,
  token: getEnvVar("GITLAB_TOKEN", "GitLab Token", true)
});

const projectId = config.gitlab.projectId;

export async function getIssue(id: number) {
  try {
    return await api.Issues.show(projectId, id);
  } catch (e) {
    return null;
  }
}

export async function getMergeRequest(id: number) {
  try {
    return await api.MergeRequests.show(projectId, id);
  } catch (e) {
    return null;
  }
}

export async function getMergeRequestApprovals(id: number) {
  try {
    return (await api.MergeRequestApprovals.approvalState(
      projectId,
      id
    )) as Types.MergeRequestLevelMergeRequestApprovalSchema;
  } catch (e) {
    return null;
  }
}

export async function getMergeRequestPipelines(id: number) {
  try {
    return await api.MergeRequests.pipelines(projectId, id);
  } catch (e) {
    return null;
  }
}
