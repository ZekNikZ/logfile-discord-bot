import { Gitlab, Types } from "@gitbeaker/node";
import config from "../config/config";
import { getEnvVar } from "../util/env";

const api = new Gitlab({
  host: config.gitlab.host,
  token: getEnvVar("GITLAB_TOKEN", "GitLab Token", true)
});

const projectId = config.gitlab.projectId;

export async function getIssue(id: number): Promise<Types.IssueSchema | null> {
  try {
    return await api.Issues.show(projectId, id);
  } catch (e) {
    return null;
  }
}

export async function getMergeRequest(id: number): Promise<Types.MergeRequestSchema | null> {
  try {
    return await api.MergeRequests.show(projectId, id);
  } catch (e) {
    return null;
  }
}

export async function getMergeRequestApprovals(
  id: number
): Promise<Types.MergeRequestLevelMergeRequestApprovalSchema | null> {
  try {
    return (await api.MergeRequestApprovals.approvalState(
      projectId,
      id
    )) as Types.MergeRequestLevelMergeRequestApprovalSchema;
  } catch (e) {
    return null;
  }
}
