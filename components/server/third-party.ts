import { redent } from '../../common/indent';

function renderApproveDialog(numSpaces?: number): string {
  return redent(`
    <dialog data-rel-id="approve-dialog">
      <form method="dialog" class="flex-col-wrap" data-rel-id="approve-form">
        <div class="third-party-readme flex-col-wrap">
          <div class="flex-row-wrap">
            <img class="avatar" data-rel-id="form-gh-avatar" src="">
            <div class="author-text">
              This script was authored by github user
              <a href="" data-rel-id="form-gh-user-link"></a>.
            </div>
          </div>
          <br>
          Warning: Fiolin cannot guarantee that third-party scripts work as
          advertised. Your files never leave your browser, even when using
          third-party scripts, but you should only run and download the files
          produced by third-party scripts if you trust the script's author.
          <div>
            <i>
              <a href="/doc/third-party">Learn more about third-party scripts.</a>
            </i>
          </div>
        </div>
        <div class="flex-row-wrap">
          <label>
            Type author's github username to approve
            <input
              type="text" name="gh-user-name" autofocus
              placeholder="github-user" required
            />
          </label>
          <label>
            Don't ask again for this script
            <input type="checkbox" name="remember" />
          </label>
        </div>
        <div class="flex-row-wrap">
          <button type="submit">Load Script</button>
          <button value="cancel" formnovalidate>Cancel</button>
        </div>
      </form>
    </dialog>
  `, ' '.repeat(numSpaces || 0));
}

export function renderThirdParty(visible: boolean, numSpaces?: number) {
  const hidden = visible ? '' : 'hidden'
  return redent(`
    <div class="third-party flex-row-wrap ${hidden}" data-rel-id="third-party">
      <img class="avatar" data-rel-id="gh-avatar" src="">
      <div class="flex-col-wrap">
        <div class="author-text">
          This script was authored by github user
          <a href="" data-rel-id="gh-user-link"></a>.
        </div>
        <div>
          <i>
            <a href="/doc/third-party">Learn more about third-party scripts.</a>
          </i>
        </div>
      </div>
      ${renderApproveDialog((numSpaces || 0) + 2)}
    </div>
  `, ' '.repeat(numSpaces || 0));
}