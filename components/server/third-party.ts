import { redent } from '../../common/indent';

export function renderThirdParty(visible: boolean, numSpaces?: number) {
  const hidden = visible ? '' : 'hidden'
  return redent(`
    <div class="third-party flex-row-wrap ${hidden}" data-rel-id="third-party">
      <img class="avatar" data-rel-id="gh-avatar" src="">
      <div class="flex-col-wrap">
        <div>
          This script was authored by github user
          <a href="" data-rel-id="gh-user-link"></a>.
        </div>
        <div>
          <i>
            <a href="/doc/third-party">Learn more about third-party scripts.</a>
          </i>
        </div>
      </div>
    </div>
  `, ' '.repeat(numSpaces || 0));
}