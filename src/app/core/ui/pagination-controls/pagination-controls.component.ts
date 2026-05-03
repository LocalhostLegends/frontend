import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
@Component({
    selector: 'app-pagination-controls',
    standalone: true,
    imports: [CommonModule, MatButtonModule],
    templateUrl: './pagination-controls.component.html',
    styleUrls: ['./pagination-controls.component.scss'],
})
export class PaginationControlsComponent {
    @Input()
    page = 1;
    @Input()
    limit = 10;
    @Input()
    total = 0;
    @Input()
    itemsCount = 0;
    @Output()
    prev = new EventEmitter<void>();
    @Output()
    next = new EventEmitter<void>();
    canPrev = computed(() => this.page > 1);
    canNext = computed(() => this.page * this.limit < this.total);
}
