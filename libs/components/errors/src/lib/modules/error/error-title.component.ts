import { Component, Input } from '@angular/core';

/**
 * Specifies a title to display with the error message.
 */
@Component({
  selector: 'sky-error-title',
  template: '<ng-content></ng-content>',
})
export class SkyErrorTitleComponent {
  /**
   * Indicates whether to replace the default title. If `false`, the content
   * from this component is added after the default title.
   * @default false
   */
  @Input()
  public replaceDefaultTitle = false;
}
