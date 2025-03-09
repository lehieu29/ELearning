import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TimePipe } from "./time.pipe";
import { DurationPipe } from './duration.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';
import { FileSizePipe } from './file-size.pipe';
import { HighlightPipe } from './highlight.pipe';
import { TruncatePipe } from './truncate.pipe';
import { RelativeTimePipe } from './relative-time.pipe';
import { NumberWithCommasPipe } from './number-with-commas.pipe';
import { FilterArrayPipe } from './filter-array.pipe';
import { SortArrayPipe } from './sort-array.pipe';

@NgModule({
    imports: [CommonModule],
    declarations: [
        TimePipe,
        DurationPipe,
        SafeHtmlPipe,
        FileSizePipe,
        HighlightPipe,
        TruncatePipe,
        RelativeTimePipe,
        NumberWithCommasPipe,
        FilterArrayPipe,
        SortArrayPipe
    ],
    exports: [
        TimePipe,
        DurationPipe,
        SafeHtmlPipe,
        FileSizePipe,
        HighlightPipe,
        TruncatePipe,
        RelativeTimePipe,
        NumberWithCommasPipe,
        FilterArrayPipe,
        SortArrayPipe
    ]
})
export class SharedPipesModule {}