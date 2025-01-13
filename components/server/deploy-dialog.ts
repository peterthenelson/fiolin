import { redent } from '../../common/indent';

export function deployDialog(indent?: number): string {
  return redent(`
    <dialog data-rel-id="deploy-dialog">
      <form method="dialog" class="flex-col-wrap" data-rel-id="deploy-form">
        <div class="flex-row-wrap">
          <div class="deploy-readme">
            This shell script will create or update a github repository and
            publish it on github.io.  It requires the
            <a href="https://cli.github.com">github cli</a> to be installed.
            If you prefer, you can copy the
            <a href="https://github.com/peterthenelson/fiolin-template">template
            repo</a> and follow the documentation there to develop and deploy
            fiolin scripts.
          </div>
        </div>
        <div class="flex-row-wrap">
          <label>
            Script id (lowercase, no spaces)
            <input
              type="text" name="script-id" data-rel-id="script-id"
              pattern="^[a-z0-9_\\-]+$" placeholder="script-id"
              required autofocus
            />
          </label>
        </div>
        <div class="flex-row-wrap">
          <label>
            Github username
            <input
              type="text" name="gh-user-name"
              placeholder="github-user" required
            />
          </label>
          <label>
            Github repository
            <input
              type="text" name="gh-repo-name"
              placeholder="github-repo" required
            />
          </label>
        </div>
        <div class="flex-row-wrap">
          <label>
            Default Branch
            <input
              type="text" name="gh-default-branch"
              placeholder="github-default-branch" value="main" required
            />
          </label>
          <label>
            Github Pages Branch
            <input
              type="text" name="gh-pages-branch"
              placeholder="github-pages-branch" value="gh-pages" required
            />
          </label>
        </div>
        <div class="flex-row-wrap">
          <label>
            Shell language
            <select name="lang" required>
              <option value="SH">
                Bash file (Mac, Linux)
              </option>
              <option value="PS1">
                Powershell file (Windows)
              </option>
            </select>
          </label>
        </div>
        <div class="flex-row-wrap">
          <button type="submit">Deploy Script</button>
          <button value="cancel" formnovalidate>Cancel</button>
        </div>
      </form>
    </dialog>
  `, ' '.repeat(indent || 0));
}