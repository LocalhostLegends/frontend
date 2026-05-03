import { Injectable, computed, inject, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShellLayoutService {
  private breakpoint = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpoint.observe('(max-width: 959px)').pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  private sidenavOpen = signal(false);

  readonly drawerOpened = computed(() => {
    if (!this.isMobile()) {
      return true;
    }
    return this.sidenavOpen();
  });

  constructor() {
    effect(() => {
      if (!this.isMobile()) {
        this.sidenavOpen.set(true);
      }
    });
  }

  toggleSidenav(): void {
    if (!this.isMobile()) {
      return;
    }
    this.sidenavOpen.update((v) => !v);
  }

  closeSidenavIfMobile(): void {
    if (this.isMobile()) {
      this.sidenavOpen.set(false);
    }
  }

  onDrawerOpenedChange(opened: boolean): void {
    if (!this.isMobile()) {
      return;
    }
    this.sidenavOpen.set(opened);
  }
}
