import { SelectionModel } from '@angular/cdk/collections';
import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Self,
  AfterViewInit
} from '@angular/core';
import { MatCell, MatRow } from '@angular/material';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';

@Directive({
  selector: '[matCellKeyboardSelection]'
})
export class MatCellKeyboardSelectionDirective
  implements OnInit, OnDestroy, AfterViewInit {
  private dataSource: TableVirtualScrollDataSource<any>;
  private cells: NodeListOf<HTMLElement>;
  private renderedData: any[];

  @Input('matCellKeyboardSelection') set MatCellKeyboardSelection(selection) {
    this.selection = selection;
  }

  @Input() selection: SelectionModel<any>;
  @Input() matTable: any;


  @Input() toggleOnEnter = true;
  @Input() selectOnFocus = true;
  @Input() deselectOnBlur = false;
  @Input() preventNewSelectionOnTab = false;

  @Input() token: string;
  @Input() rowIndex: string;
  @Input() colIndex: string;
  @Input() colLength: string;

  private unsubscriber$ = new Subject();

  // @Host() private matTable: MatTable<any>
  // @Host() @Self() private row: MatRow
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    // console.loglog('init cell directive');
  }

  ngAfterViewInit() {

    // if (!this.selection) {
    //     throw new Error('Attribute \'selection\' is required');
    //   }
    if (!this.matTable || !this.matTable) {
      throw new Error('MatTable [matTable] is required');
    }

    if (this.el.nativeElement.tabIndex < 0) {
      this.el.nativeElement.tabIndex = 0;
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
        this.cells = this.getTableCells();
      });
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  @HostListener('focus', ['$event']) onFocus() {
    if (this.selectOnFocus && !this.selection.isMultipleSelection()) {
      this.selection.select(`${this.token}-${this.colIndex}`);
    }

    if (this.selectOnFocus && this.preventNewSelectionOnTab) {
      this.cells.forEach(cell => {
        if (cell !== this.el.nativeElement) {
          cell.tabIndex = -1;
        }
      });
    }
  }

  @HostListener('blur', ['$event']) onBlur() {
    if (this.deselectOnBlur && !this.selection.isMultipleSelection()) {
      this.selection.deselect(`${this.token}-${this.colIndex}`);
    }
    if (this.selectOnFocus) {
      this.el.nativeElement.tabIndex = 0;
    }
  }

  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent) {
    let newCell;
    const currentIndex = this.renderedData.findIndex(row => row.id == this.token) || 0;

    const rowCalc = Math.ceil(((currentIndex / Number(this.colLength)))+ 1) * Number(this.colLength);
    if (event.key === 'ArrowRight') {
      newCell = this.cells[currentIndex + this.colIndex + 1];
    }else if (event.key === 'ArrowLeft') {
      newCell = this.cells[(currentIndex + Number(this.colIndex)) - 1];
    }else if (event.key === 'ArrowDown') {
      newCell = this.cells[rowCalc + 1];
    } else if (event.key === 'ArrowUp') {
      newCell = this.cells[rowCalc - 1];
    }
  
    if (newCell) {
      newCell.focus();
    }
  }

  private getTableCells() {
    let el = this.el.nativeElement;

    while (el && el.parentNode) {
      el = el.parentNode;
      if (
        (el.tagName && el.tagName.toLowerCase() === 'mat-table') ||
        el.hasAttribute('mat-table')
      ) {
        return el.querySelectorAll('mat-cell, td[mat-cell]');
      }
    }
    return null;
  }
}
