import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemePalette } from '@angular/material/core';
type ButtonType = 'button' | 'submit' | 'reset';
type ButtonVariant = 'raised' | 'flat' | 'stroked' | 'basic' | 'icon';
@Component({
    selector: 'app-loading-button',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule, MatTooltipModule],
    templateUrl: './loading-button.component.html',
    styleUrls: ['./loading-button.component.scss'],
})
export class LoadingButtonComponent {
    @Input()
    loading = false;
    @Input()
    disabled = false;
    @Input()
    type: ButtonType = 'button';
    @Input()
    variant: ButtonVariant = 'raised';
    @Input()
    color: ThemePalette = 'primary';
    @Input()
    spinnerDiameter = 20;
    @Input()
    tooltip = '';
    @Input()
    buttonClass = '';
    @Input()
    ariaLabel = 'Loading button';
    @Output()
    pressed = new EventEmitter<Event>();
    get isDisabled(): boolean {
        return this.disabled || this.loading;
    }
    onClick(event: Event): void {
        if (this.isDisabled) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        this.pressed.emit(event);
    }
}
