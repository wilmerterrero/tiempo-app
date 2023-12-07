import core from "@actions/core";
import { context } from "@actions/github";
import { Octokit } from "@octokit/core";

/**
 * @param releaseId {{releaseId: number}}
 * @returns {Promise<void>}
 */
export default async function uploadVersionJSON({ releaseId }) {
  try {
    if (process.env.GH_PERSONAL_ACCESS_TOKEN === undefined) {
      core.setFailed("GH_PERSONAL_ACCESS_TOKEN is required");
    }
    if (process.env.GIST_ID === undefined) {
      core.setFailed("GIST_ID is required");
    }
    if (releaseId === undefined) {
      core.setFailed("releaseId is required");
    }

    const octokit = new Octokit({
      auth: process.env.GH_PERSONAL_ACCESS_TOKEN,
    });

    const versionFilename = "latest.json";
    const ghVersion = "2022-11-28";

    core.info("------------------------------------");
    core.info(`Updating ${versionFilename} for release ${releaseId}`);
    core.info(`Owner: ${context.repo.owner}`);
    core.info(`Repo: ${context.repo.repo}`);
    core.info("------------------------------------");

    const assets = await octokit.request(
      "GET /repos/{owner}/{repo}/releases/{release_id}/assets",
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        release_id: releaseId,
        headers: {
          "X-GitHub-Api-Version": ghVersion,
        },
      }
    );
    const asset = assets.data.find((e) => e.name === versionFilename);

    if (!asset) {
      core.setFailed(`Asset ${versionFilename} not found`);
    }

    const assetContent = await (await fetch(asset.browser_download_url)).json();

    const action = await octokit.request("PATCH /gists/{gist_id}", {
      gist_id: process.env.GIST_ID,
      description: "Updating file via Release Action",
      files: {
        [versionFilename]: {
          content: JSON.stringify(assetContent, null, 2),
        },
      },
      headers: {
        "X-GitHub-Api-Version": ghVersion,
      },
    });

    core.info(`Succesfully updated: ${versionFilename}`);
    core.info("------------------------------------");
    core.info(
      action.data?.files
        ? JSON.stringify(action.data?.files[versionFilename], null, 2)
        : {}
    );
    core.info("------------------------------------");
  } catch (error) {
    core.setFailed(error);
  }
}

function run() {
  core.info("Args passed: " + process.argv);
  const releaseId = parseInt(process.argv[2], 10);
  uploadVersionJSON({ releaseId });
}

run();
