import { FiolinScript } from '../common/types';
import { indent, dedent } from '../common/indent';
import YAML from 'yaml';

export interface DeployOptions {
  gh: {
    userName: string;
    repoName: string;
    defaultBranch: string;
    pagesBranch: string;
  }
  scriptId: string;
  lang: 'SH' | 'BAT';
}

export function deployScript(script: FiolinScript, opts: DeployOptions): File {
  if (opts.lang === 'SH') {
    const contents = bashScript(script, opts);
    return new File([new Blob([contents])], 'deploy-to-github.sh');
  } else if (opts.lang === 'BAT') {
    const contents = batFile(script, opts);
    return new File([new Blob([contents])], 'deploy-to-github.bat');
  } else {
    throw new Error(`Unrecognized lang options: ${opts.lang}`);
  }
}

function genEof(s: string): string {
  if (!s.includes('EOF')) return 'EOF';
  throw new Error('TODO: Generate non-colliding EOFs')
}

function bashScript(script: FiolinScript, opts: DeployOptions): string {
  const json = JSON.stringify(script, null, 2);
  const { code, ...scriptNoCode } = script;
  const yml = YAML.stringify(scriptNoCode);
  return dedent(`
    #!/bin/bash
    set -euo pipefail
    USERNAME="${opts.gh.userName}"
    REPONAME="${opts.gh.repoName}"
    MAINBRANCH="${opts.gh.defaultBranch}"
    PAGESBRANCH="${opts.gh.pagesBranch}"
    REPOURL="https://github.com/$USERNAME/$REPONAME.git"
    FIOLID="${opts.scriptId}"
    if ! which gh >/dev/null; then
      echo "Please install the github cli tool before running this:"
      echo "  https://cli.github.com"
      exit 1
    fi
    git_commit_p() {
      local message="$1"
      if git diff --cached --quiet; then
        echo "No changes staged"
      else
        git -c user.name="deploy-to-gh" \\
            -c user.email="noreply@fiolin.org" \\
            commit -m "$message"
      fi
    }
    with_retries() {
      local cmd="$1"
      local retries="$2"
      local retry_msg="$3"
      local fail_msg="$4"
      for ((i=0; i < retries; i++)); do
        if eval "$cmd"; then
          return 0
        else
          echo "$retry_msg"
          sleep 1
        fi
      done
      echo "$fail_msg"
      return 1
    }
    clone_or_create() {
      local repo="$1"
      if ! git ls-remote "$repo" &>/dev/null; then
        # The very commonly installed old version of gh has a race condition
        # that causes the --clone option to fail here, so we have to just
        # manually wait for it to show up.
        gh repo create "$repo" --public -p peterthenelson/fiolin-template
        MAINBRANCH=main
        echo "Waiting for $repo to be created..."
        with_retries "git ls-remote --exit-code $repo -b $MAINBRANCH" \
          5 "Still waiting for repo branch main to be created..." \
          "Searching for main branch on remote failed 5 times"
      fi
      git clone "$repo"
    }
    TMPDIR=$(mktemp -d)
    cd "$TMPDIR"
    clone_or_create "$REPOURL"
    cd "$REPONAME"
    mkdir -p fiols
    cat >"fiols/$FIOLID.yml" <<${genEof(yml)}
    ${indent(yml, '    ')}
    ${genEof(yml)}
    cat >"fiols/$FIOLID.py" <<${genEof(code.python)}
    ${indent(code.python, '    ')}
    ${genEof(code.python)}
    git add .
    git_commit_p "Add $FIOLID yml/py to repository"
    git push -u origin "$MAINBRANCH"
    git checkout -b "$PAGESBRANCH"
    git pull origin "$PAGESBRANCH" || echo "new github pages branch"
    git ls-files | grep -v '\\.json$' | xargs git rm
    cat >"$FIOLID.json" <<${genEof(json)}
    ${indent(json, '    ')}
    ${genEof(json)}
    git add .
    git_commit_p "Publish $FIOLID.json to gh-pages"
    git push origin "$PAGESBRANCH"
    with_retries "curl -s -f https://$USERNAME.github.io/$REPONAME/$FIOLID.json >/dev/null" \
      100 "Still waiting for github pages deployment to be live..." \
      "Waiting for github pages deployment failed 5 times"
    echo " "
    echo "You now have your very own repository of fiolin scripts. Check out"
    echo "the README to see how to continue developing your scripts locally:"
    echo "  https://github.com/$USERNAME/$REPONAME"
    echo "Your script has been published on github pages:"
    echo "  https://$USERNAME.github.io/$REPONAME/$FIOLID.json"
    echo "You (and others) can run your script on fiolin.org:"
    echo "  https://fiolin.org/third-party?gh=$USERNAME/$REPONAME/$FIOLID"
  `);
}

function batFile(script: FiolinScript, opts: DeployOptions): string {
  return dedent(`
    echo "TODO: IMPLEMENT BATCH FILE"
    exit /b 1
  `);
}
