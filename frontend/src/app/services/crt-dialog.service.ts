import {
  Injectable,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
} from '@angular/core';
import { Observable } from 'rxjs';
import { CrtDialogComponent } from '../components/crt-dialog/crt-dialog.component';

@Injectable({ providedIn: 'root' })
export class CrtDialogService {
  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  confirm(message: string, confirmLabel = 'CONFIRM', cancelLabel = 'CANCEL'): Observable<boolean> {
    return new Observable(observer => {
      const ref = createComponent(CrtDialogComponent, {
        environmentInjector: this.injector,
      });

      ref.instance.message      = message;
      ref.instance.confirmLabel = confirmLabel;
      ref.instance.cancelLabel  = cancelLabel;

      const cleanup = () => {
        this.appRef.detachView(ref.hostView);
        ref.destroy();
        document.body.removeChild(domEl);
      };

      ref.instance.confirmed.subscribe(() => {
        cleanup();
        observer.next(true);
        observer.complete();
      });

      ref.instance.cancelled.subscribe(() => {
        cleanup();
        observer.next(false);
        observer.complete();
      });

      this.appRef.attachView(ref.hostView);
      const domEl = (ref.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domEl);
    });
  }
}
