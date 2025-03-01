import { Directive, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";

@Directive()
export abstract class BaseComponent implements OnInit, OnDestroy {
    _onDestroySub: Subject<void> = new Subject<void>();

    ngOnInit(): void {
        
    }

    ngOnDestroy(): void {
        try {
            if(this._onDestroySub) {
                this._onDestroySub.complete();   
            }
        } catch(error) {
            console.error(error);
        }
    }
}