import { Octokit } from "@octokit/core";

const GH_TOKEN = "<GITHUB_TOKEN>";
export default async function uploadVersionJSON({ releaseId }) {
  try {
    const octokit = new Octokit({
      auth: GH_TOKEN,
    });

    const versionFilename = "latest.json";

    const assets = await octokit.request(
      "GET /repos/{owner}/{repo}/releases/{release_id}/assets",
      {
        owner: "<OWNER>",
        repo: "<REPO>",
        release_id: releaseId,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    const asset = assets.data.find((e) => e.name === versionFilename);

    if (!asset) {
      throw new Error(`Asset ${versionFilename} not found`);
    }

    const assetContent = await (await fetch(asset.browser_download_url)).json();

    // "aca77113b2fcf3882e4052b654696e34"
    const action = await octokit.request("PATCH /gists/{gist_id}", {
      gist_id: "GIST_ID",
      description: "Updating file via API",
      files: {
        [versionFilename]: {
          content: JSON.stringify(assetContent, null, 2),
        },
      },
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    console.log(action.data?.files ? action.data?.files[versionFilename] : {});
    console.log(action.status);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

function run() {
  // 132748700
  const releaseId = parseInt(process.argv[2], 10);
  uploadVersionJSON({ releaseId });
}

run();
