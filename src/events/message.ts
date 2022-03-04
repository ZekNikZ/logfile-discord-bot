import { Client, ColorResolvable, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { dataLogger } from "../util/log";
import { getIssue, getMergeRequest, getMergeRequestApprovals, getMergeRequestPipelines } from "../gitlab";
import { Types } from "@gitbeaker/node";
import color from "../util/color";

interface Pattern {
  pattern: RegExp;
  handler: (msg: Message, content: string, client: Client) => void;
}

function determineIssueColor(issue: Types.IssueSchema) {
  if (issue.state === "closed") {
    return color.RED;
  } else if (issue.labels?.includes("In progress")) {
    return color.GREEN;
  } else if (issue.labels?.includes("Blocked")) {
    return color.ORANGE;
  } else if (issue.labels?.includes("Waiting for CR") || issue.labels?.includes("Ready for QA")) {
    return color.TEAL;
  } else if (issue.labels?.includes("High Priority")) {
    return color.YELLOW;
  } else if (issue.labels?.includes("Epic")) {
    return color.PURPLE;
  }
  return color.BLUE;
}

function determineMergeRequestColor(
  mr: Types.MergeRequestSchema,
  approvals: Types.MergeRequestLevelMergeRequestApprovalSchema | null
): ColorResolvable {
  if (mr.state === "closed") {
    return color.RED;
  } else if (mr.state === "merged") {
    return color.PURPLE;
  } else if (mr.labels?.includes("Blocked") || !mr.blocking_discussions_resolved) {
    return color.ORANGE;
  } else if (approvals?.approved_by && approvals.approved_by.length >= approvals.approvals_required) {
    return color.GREEN;
  }
  return color.BLUE;
}

async function issueHandler(msg: Message, content: string) {
  const num = parseInt(content.slice(1));

  dataLogger.info(`Found a request for issue #${num}`);

  const issue = await getIssue(num);
  if (!issue) {
    return;
  }

  const labels: Record<string, string> =
    issue.labels
      ?.filter((label) => label.includes(":"))
      .map((label) => label.split(": "))
      .reduce((acc, [group, val]) => ({ ...acc, [group]: val }), {}) ?? {};

  const embed = new MessageEmbed()
    .setColor(determineIssueColor(issue))
    .setTitle((`#${num}: ${issue.title}` + (issue.state === "closed" ? " (CLOSED)" : "")).slice(0, 256))
    .setDescription(issue.description)
    .setURL(issue.web_url)
    .setAuthor(
      issue.assignees && issue.assignees.length > 0
        ? {
            name: `Assignee: ${issue.assignees[0].name}`,
            iconURL: issue.assignees[0].avatar_url as string
          }
        : {
            name: "Unassigned"
          }
    )
    .setTimestamp(Date.parse(issue.created_at))
    .addFields(
      ["Points", "Status", "Group", "Priority"].map((field) => ({
        name: field,
        value: labels[field] ?? "N/A",
        inline: true
      }))
    );

  if (!issue.assignees || issue.assignees.length == 0 || issue.assignees[0].id !== issue.author.id) {
    embed.setFooter({ text: `Reporter: ${issue.author.name}`, iconURL: issue.author.avatar_url as string });
  }

  if (issue.labels?.includes("Epic")) {
    embed.addFields({
      name: "Epic",
      value: "Yes",
      inline: true
    });
  }

  const buttons = new MessageActionRow().addComponents([
    new MessageButton().setLabel(`View Issue #${num}`).setURL(issue.web_url).setStyle("LINK")
  ]);

  [...issue.description.matchAll(/!\d+/g)]
    .map((match) => parseInt(match[0].slice(1)))
    .forEach((mr) => {
      buttons.addComponents(
        new MessageButton()
          .setLabel(`Issue #${mr}`)
          .setURL(issue.web_url.replace(/issues\/.+/, `merge_requests/${mr}`))
          .setStyle("LINK")
      );
    });

  buttons.addComponents([new MessageButton().setLabel("Hide").setCustomId("hide").setStyle("DANGER")]);

  msg.channel.send({ embeds: [embed], components: [buttons] });
}

function transformPipelineStatus(status: Types.PipelineStatus | undefined) {
  switch (status) {
    case "pending":
      return ":arrows_counterclockwise: Pending";
    case "running":
      return ":arrows_counterclockwise: Running";
    case "success":
      return ":white_check_mark: Passed";
    case "failed":
      return ":no_entry: Failed";
    case "canceled":
      return ":stop_button: Canceled";
    case "skipped":
      return ":fast_forward: Skipped";
    default:
      return ":grey_question: Unknown";
  }
}

async function mergeRequestHandler(msg: Message, content: string) {
  const num = parseInt(content.slice(1));

  dataLogger.info(`Found a request for merge request #${num}`);

  const mr = await getMergeRequest(num);
  if (!mr) {
    return;
  }

  const approvals = await getMergeRequestApprovals(num);

  const pipelines = await getMergeRequestPipelines(num);
  const latestPipeline = pipelines?.sort((a, b) => b.id - a.id)[0];

  const embed = new MessageEmbed()
    .setColor(determineMergeRequestColor(mr, approvals))
    .setTitle(
      (
        `!${num}: ${mr.title}` +
        (mr.state === "merged" ? " (MERGED)" : "") +
        (mr.state === "closed" ? " (CLOSED)" : "")
      ).slice(0, 256)
    )
    .setDescription(mr.description)
    .setURL(mr.web_url)
    .setAuthor({
      name: mr.author.name as string,
      iconURL: mr.author.avatar_url as string
    })
    .setTimestamp(Date.parse(mr.created_at))
    .addFields([
      {
        name: "Source Branch",
        value: `\`${mr.source_branch}\``,
        inline: true
      },
      {
        name: "Target Branch",
        value: `\`${mr.target_branch}\``,
        inline: true
      },
      {
        name: "Approvals",
        value: approvals
          ? `${approvals.approvals_required - approvals.approvals_left}/${approvals.approvals_required}`
          : "N/A",
        inline: true
      },
      {
        name: "Unresolved Conversations",
        value: mr.blocking_discussions_resolved ? ":white_check_mark: No" : ":no_entry: Yes",
        inline: true
      },
      {
        name: "Pipeline Status",
        value: transformPipelineStatus(latestPipeline?.status),
        inline: true
      },
      {
        name: "Merge Status",
        value: mr.has_conflicts ? ":no_entry: Merge Conflicts" : ":white_check_mark: No Conflicts",
        inline: true
      }
    ]);

  if (mr.labels?.includes("Blocked")) {
    embed.addFields({
      name: "Blocked",
      value: mr.labels?.includes("Blocked") ? "Yes" : "No",
      inline: true
    });
  }

  const buttons = new MessageActionRow().addComponents([
    new MessageButton().setLabel(`View Merge Request !${num}`).setURL(mr.web_url).setStyle("LINK"),
    new MessageButton()
      .setLabel("View Pipeline")
      .setURL(`${mr.web_url.replaceAll(/merge_requests\/.+/g, "pipelines/")}${latestPipeline?.id}`)
      .setStyle("LINK")
  ]);

  [...mr.description.matchAll(/#\d+/g)]
    .map((match) => parseInt(match[0].slice(1)))
    .forEach((issue) => {
      buttons.addComponents(
        new MessageButton()
          .setLabel(`Issue #${issue}`)
          .setURL(mr.web_url.replace(/merge_requests\/.+/, `issues/${issue}`))
          .setStyle("LINK")
      );
    });

  buttons.addComponents([new MessageButton().setLabel("Hide").setCustomId("hide").setStyle("DANGER")]);

  msg.channel.send({ embeds: [embed], components: [buttons] });
}

const patterns: Pattern[] = [
  {
    pattern: /#\d+/g,
    handler: issueHandler
  },
  {
    pattern: /!\d+/g,
    handler: mergeRequestHandler
  }
];

export default function onMessage(client: Client, msg: Message): void {
  if (msg.author.bot) {
    return;
  }

  for (const { pattern, handler } of patterns) {
    const matches = msg.content.matchAll(pattern);
    if (matches) {
      for (const match of matches) {
        handler(msg, match[0], client);
      }
    }
  }
}
