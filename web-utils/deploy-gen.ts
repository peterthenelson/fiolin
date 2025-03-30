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
  lang: 'SH' | 'PS1';
}

export function deployScript(script: FiolinScript, yml: string, opts: DeployOptions): File {
  if (opts.lang === 'SH') {
    const contents = bashScript(script, yml, opts);
    return new File([new Blob([contents])], 'deploy-to-github.sh');
  } else if (opts.lang === 'PS1') {
    const contents = ps1File(script, yml, opts);
    return new File([new Blob([contents])], 'deploy-to-github.ps1');
  } else {
    throw new Error(`Unrecognized lang options: ${opts.lang}`);
  }
}

function genEof(s: string): string {
  let eof = 'EOF';
  while (s.includes(eof)) {
    eof += `${Math.floor(Math.random() * 10)}`;
  }
  return eof;
}

function bashScript(script: FiolinScript, yml: string, opts: DeployOptions): string {
  const json = JSON.stringify(script, null, 2);
  const { code, ...scriptNoCode } = script;
  return dedent(`
    #!/bin/bash
    set -euo pipefail
    USERNAME="${opts.gh.userName}"
    REPONAME="${opts.gh.repoName}"
    MAINBRANCH="${opts.gh.defaultBranch}"
    PAGESBRANCH="${opts.gh.pagesBranch}"
    REPOURL="https://github.com/$USERNAME/$REPONAME.git"
    FIOLID="${opts.scriptId}"
    echo "This script will deploy script $FIOLID to github.com/$USERNAME/$REPONAME"
    echo "Press return to continue."
    read
    exit_trap() {
      local status="$?"
      if [ $status -ne 0 ]; then
        echo "Deploy script failed. See error messages above."
      fi
      read
      exit $status
    }
    trap exit_trap EXIT
    if ! which gh >/dev/null; then
      echo "Please install the github cli tool before running this:"
      echo "  https://cli.github.com"
      exit 1
    fi
    gh auth status -a
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

function escAt(s: string): string {
  return s.replaceAll(/@/g, '`@');
}

function ps1File(script: FiolinScript, yml: string, opts: DeployOptions): string {
  const json = JSON.stringify(script, null, 2);
  const { code, ...scriptNoCode } = script;
  return dedent(`
    Set-StrictMode -Version Latest
    $ErrorActionPreference = "Stop"
    $USERNAME = "${opts.gh.userName}"
    $REPONAME = "${opts.gh.repoName}"
    $MAINBRANCH = "${opts.gh.defaultBranch}"
    $PAGESBRANCH = "${opts.gh.pagesBranch}"
    $REPOURL = "https://github.com/$USERNAME/$REPONAME.git"
    $FIOLID = "${opts.scriptId}"
    Write-Host "This script will deploy script $FIOLID to github.com/$USERNAME/$REPONAME" -ForegroundColor Green
    Write-Host "Press return to continue." -ForegroundColor Green
    $null = Read-Host
    trap {
      Write-Host "$_" -ForegroundColor Red
      Write-Host "Deploy script failed. See error messages above." -ForegroundColor Red
      $null = Read-Host
    }
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
      Write-Host "Please install the github cli tool before running this:" -ForegroundColor Red
      Write-Host "  https://cli.github.com" -ForegroundColor Red
      $null = Read-Host
      Exit 1
    }
    function Invoke-Strict() {
      if ($args.Count -eq 0) {
        throw "Must supply some arguments."
      }
      $command = $args[0]
      $commandArgs = @()
      if ($args.Count -gt 1) {
        $commandArgs = $args[1..($args.Count - 1)]
      }
      & $command $commandArgs
      $result = $LastExitCode
      if ($result) {
        throw "$command $commandArgs exited with code $result."
      }
    }
    Invoke-Strict gh auth status -a
    function git_commit_p {
      param ($message)
      git diff --cached --quiet
      if ($LastExitCode) {
        Invoke-Strict git -c user.name="deploy-to-gh" -c user.email="noreply@fiolin.org" commit -m $message
      } else {
        Write-Host "No changes staged" -ForegroundColor Yellow
      }
    }
    function with_retries {
      param ($cmd, $retries, $retry_msg, $fail_msg)
      for ($i = 0; $i -lt $retries; $i++) {
        try {
          Invoke-Expression $cmd
          if ($LastExitCode) {
            Write-Host $retry_msg -ForegroundColor Yellow
            Start-Sleep -Seconds 1
          } else {
            return $true
          }
        } catch {
          Write-Host $retry_msg -ForegroundColor Yellow
          Start-Sleep -Seconds 1
        }
      }
      Write-Host $fail_msg -ForegroundColor Red
      $null = Read-Host
      Exit 1
      return $false
    }
    function clone_or_create {
      param ($repo)
      if (-not (git ls-remote $repo)) {
        Invoke-Strict gh repo create $repo --public -p "peterthenelson/fiolin-template"
        $MAINBRANCH = "main"
        Write-Host "Waiting for $repo to be created..." -ForegroundColor Green
        with_retries "git ls-remote --exit-code $repo -b $MAINBRANCH" 5 "Still waiting for repo branch main to be created..." "Searching for main branch on remote failed 5 times"
      }
      Invoke-Strict git clone $repo
    }
    $TMPDIR = [System.IO.Path]::GetTempPath()
    $TMPDIR = Join-Path -Path $TMPDIR -ChildPath ([Guid]::NewGuid().ToString())
    New-Item -ItemType Directory -Force -Path $TMPDIR
    Set-Location -Path $TMPDIR
    clone_or_create $REPOURL
    Set-Location -Path $REPONAME
    New-Item -ItemType Directory -Force -Path "fiols"
    $fiolYmlPath = "fiols\\$FIOLID.yml"
    $fiolPyPath = "fiols\\$FIOLID.py"
    @"
    ${escAt(indent(yml, '    '))}
    "@ | Set-Content -Path $fiolYmlPath
    @"
    ${escAt(indent(code.python, '    '))}
    "@ | Set-Content -Path $fiolPyPath
    Invoke-Strict git add .
    git_commit_p "Add $FIOLID yml/py to repository"
    Invoke-Strict git push -u origin $MAINBRANCH
    Invoke-Strict git checkout -b $PAGESBRANCH
    # Ignore failure
    git pull origin $PAGESBRANCH
    Invoke-Strict git ls-files | Where-Object {$_ -notmatch '\.json$'} | ForEach-Object { Invoke-Strict git rm $_ }
    $fiolJsonPath = "$FIOLID.json"
    @"
    ${escAt(indent(json, '    '))}
    "@ | Set-Content -Path $fiolJsonPath
    Invoke-Strict git add .
    git_commit_p "Publish $FIOLID.json to gh-pages"
    Invoke-Strict git push origin $PAGESBRANCH
    with_retries "Invoke-WebRequest -Uri https://$USERNAME.github.io/$REPONAME/$FIOLID.json | Out-Null" 100 "Still waiting for github pages deployment to be live..." "Waiting for github pages deployment failed 5 times"
    Write-Host " "
    Write-Host "You now have your very own repository of fiolin scripts. Check out" -ForegroundColor Green
    Write-Host "the README to see how to continue developing your scripts locally:" -ForegroundColor Green
    Write-Host "  https://github.com/$USERNAME/$REPONAME" -ForegroundColor Green
    Write-Host "Your script has been published on github pages:" -ForegroundColor Green
    Write-Host "  https://$USERNAME.github.io/$REPONAME/$FIOLID.json" -ForegroundColor Green
    Write-Host "You (and others) can run your script on fiolin.org:" -ForegroundColor Green
    Write-Host "  https://fiolin.org/third-party?gh=$USERNAME/$REPONAME/$FIOLID" -ForegroundColor Green
    $null = Read-Host
  `);
}
