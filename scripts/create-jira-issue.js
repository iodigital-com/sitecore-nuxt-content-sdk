/**
 * Creates a Jira issue via the REST API when a GitHub issue or PR is opened.
 *
 * Required env vars:
 *   GITHUB          - JSON-encoded GitHub context (set via ${{ toJson(github) }})
 *   JIRA_API_TOKEN  - Bearer token for Jira REST API authentication
 *   JIRA_BASE_URL   - Base URL of the Jira instance, e.g. https://jira.hosted-tools.com
 *   JIRA_PROJECT_KEY - Jira project key, e.g. CAMPDB_0049
 *
 * Example POST body:
 *   {
 *     "fields": {
 *       "project": { "key": "CAMPDB_0049" },
 *       "summary": "[GitHub] Fix login bug",
 *       "description": "...",
 *       "issuetype": { "name": "Task" }
 *     }
 *   }
 */

const github = JSON.parse(process.env.GITHUB);

const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY;

const formatDescription = (description) => {
  if (!description) return '';

  const header = (text) =>
    Array.from(Array(6)).reduce((currText, _, i) => {
      return currText.replace(new RegExp(`^#{${i + 1}}\\s`, 'gm'), `h${i + 1}. `);
    }, text);

  const boldText = (text) => text.replace(/\*\*(.*)\*\*/gm, '*$1*');
  const quote = (text) => text.replace(/^>\s/gm, 'bq. ');
  const link = (text) => text.replace(/\[([^download].*)\]\((.*)\)/gm, '[$1|$2]');
  const image = (text) => text.replace(/!\[download\]\((.*)\)/gm, '!$1!');
  const codeBlock = (text) => text.replace(/```(\w+)([\s\S]*)```/gm, '{code:$1}$2{code}');
  const inlineCodeBlock = (text) => text.replace(/`([^`\n]+)`/gm, '{noformat}$1{noformat}');
  const comment = (text) => text.replace(/^<!---.*-->$/gm, '');

  return [header, boldText, quote, link, image, codeBlock, inlineCodeBlock, comment].reduce(
    (currText, fn) => fn(currText),
    description
  );
};

const getIssueType = (event) => {
  if (event.pull_request) return 'Task';
  if (event.issue?.labels?.some((l) => l.name.includes('bug'))) return 'Bug';
  return 'Task';
};

(async () => {
  const event = github.event;
  const issueOrPR = event.issue || event.pull_request;

  const body = {
    fields: {
      project: { key: JIRA_PROJECT_KEY },
      summary: `[GitHub] ${issueOrPR.title}`,
      description: formatDescription(issueOrPR.body),
      issuetype: { name: getIssueType(event) },
    },
  };

  try {
    const res = await fetch(`${JIRA_BASE_URL}/rest/api/2/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JIRA_API_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Jira API error:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log(`Jira issue created: ${data.key}`);
  } catch (error) {
    console.error('Error creating Jira issue:', error);
    process.exit(1);
  }
})();
