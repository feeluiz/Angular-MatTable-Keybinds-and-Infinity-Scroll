import { SelectionModel } from '@angular/cdk/collections';
import {
  Directive,
  ElementRef,
  Host,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Self,
  AfterViewInit
} from '@angular/core';
import { MatRow, MatTable, MatTableDataSource } from '@angular/material';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';

@Directive({
  selector: '[matRowKeyboardSelection]'
})
export class MatRowKeyboardSelectionDirective
  implements OnInit, OnDestroy, AfterViewInit {
  private dataSource: TableVirtualScrollDataSource<any>;
  private rows: NodeListOf<HTMLElement>;
  private renderedData: any[];

  @Input('matRowKeyboardSelection') set MatRowKeyboardSelection(selection) {
    this.selection = selection;
  }

  @Input() selection: SelectionModel<any>;
  @Input() rowModel;
  @Input() toggleOnEnter = true;
  @Input() selectOnFocus = true;
  @Input() deselectOnBlur = false;
  @Input() preventNewSelectionOnTab = false;
  @Input() matTable: MatTable<any>;
  @Input() row: MatRow;

  private unsubscriber$ = new Subject();

  // @Host() private matTable: MatTable<any>
  // @Host() @Self() private row: MatRow
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    // console.log('init directive');
  }

  ngAfterViewInit() {
    // if (!this.selection) {
    //     throw new Error('Attribute \'selection\' is required');
    //   }
    if (!this.matTable || !this.matTable.dataSource) {
      throw new Error('MatTable [dataSource] is required');
    }
    if (!this.rowModel) {
      throw new Error('[rowModel] is required');
    }
    console.log(this.rowModel);
    if (this.el.nativeElement.tabIndex < 0) {
      this.el.nativeElement.tabIndex = 0;
      console.log(this.el.nativeElement)
    }
    this.dataSource = this.matTable.dataSource as TableVirtualScrollDataSource<
      any
    >;
    this.dataSource
      .connect()
      .pipe(
        takeUntil(this.unsubscriber$),
        debounceTime(300)
      )
      .subscribe(data => {
        this.renderedData = data;
        this.rows = this.getTableRows();
        // console.log('rows', this.rows);
        if (this.rowModel) {
          const currentIndex = this.renderedData.findIndex(
            row => row.id === this.rowModel.id
          );
          const newRow = this.rows[currentIndex];
          if (newRow) {
            // console.log((<any>newRow).getAttribute('class'));
            //  newRow.focus();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  @HostListener('focus', ['$event']) onFocus() {
    if (this.selectOnFocus && !this.selection.isMultipleSelection()) {
      this.selection.select(this.rowModel);
    }

    if (this.selectOnFocus && this.preventNewSelectionOnTab) {
      this.rows.forEach(row => {
        if (row !== this.el.nativeElement) {
          row.tabIndex = -1;
        }
      });
    }
  }

  @HostListener('blur', ['$event']) onBlur() {
    if (this.deselectOnBlur && !this.selection.isMultipleSelection()) {
      this.selection.deselect(this.rowModel);
    }
    if (this.selectOnFocus) {
      this.el.nativeElement.tabIndex = 0;
    }
  }

  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent) {
    let newRow;
    const currentIndex = this.renderedData.findIndex(
      row => row.id === this.rowModel.id
    );
    if (event.key === 'ArrowDown') {
      newRow = this.rows[currentIndex + 1];
    } else if (event.key === 'ArrowUp') {
      newRow = this.rows[currentIndex - 1];
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (this.toggleOnEnter) {
        this.selection.toggle(this.rowModel);
      }
      event.preventDefault();
    }
    if (newRow) {
      newRow.focus();
    }
  }

  private getTableRows() {
    let el = this.el.nativeElement;
    while (el && el.parentNode) {
      el = el.parentNode;
      if (
        (el.tagName && el.tagName.toLowerCase() === 'mat-table') ||
        el.hasAttribute('mat-table')
      ) {
        return el.querySelectorAll('mat-row, tr[mat-row]');
      }
    }
    return null;
  }
}
