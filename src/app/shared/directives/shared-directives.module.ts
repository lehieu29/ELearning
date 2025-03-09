import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ClickOutsideDirective } from "./click-outside.directive";
import { DebounceClickDirective } from './debounce-click.directive';
import { TooltipDirective } from './tooltip.directive';
import { AutoFocusDirective } from './auto-focus.directive';
import { CopyToClipboardDirective } from './copy-to-clipboard.directive';
import { InfiniteScrollDirective } from './infinite-scroll.directive';
import { TrackVisibleDirective } from './track-visible.directive';
import { ContentEditableDirective } from './content-editable.directive';
import { NumberOnlyDirective } from './number-only.directive';
import { LazyLoadImageDirective } from "./lazy-load.directive";

@NgModule({
    imports: [CommonModule],
    declarations: [
        ClickOutsideDirective,
        LazyLoadImageDirective,
        DebounceClickDirective,
        TooltipDirective,
        AutoFocusDirective,
        CopyToClipboardDirective,
        InfiniteScrollDirective,
        TrackVisibleDirective,
        ContentEditableDirective,
        NumberOnlyDirective
    ],
    exports: [
        ClickOutsideDirective,
        LazyLoadImageDirective,
        DebounceClickDirective,
        TooltipDirective,
        AutoFocusDirective,
        CopyToClipboardDirective,
        InfiniteScrollDirective,
        TrackVisibleDirective,
        ContentEditableDirective,
        NumberOnlyDirective
    ]
})
export class SharedDirectivesModule {}