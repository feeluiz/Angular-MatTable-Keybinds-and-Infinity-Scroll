import { Component } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { DATA } from './data';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';

export interface PeriodicElement {
  id?: string;
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = DATA;

/**
 * @title Basic use of `<table mat-table>`
 */
@Component({
  selector: 'table-basic-example',
  styleUrls: ['table-basic-example.css'],
  templateUrl: 'table-basic-example.html'
})
export class TableBasicExample {
  displayedColumns: string[] = ['id', 'position', 'name', 'weight', 'symbol'];
  dataSource: TableVirtualScrollDataSource<PeriodicElement>;
  public selection: SelectionModel<PeriodicElement>;
  public selectionCell: SelectionModel<any>;
  constructor() {
    this.displayedColumns = [...this.displayedColumns, ...Array.apply(0, new Array(100)).map((v,i) => `col ${i+5}`)]
    this.dataSource = new TableVirtualScrollDataSource<PeriodicElement>(
      ELEMENT_DATA
    );
    this.selection = new SelectionModel<PeriodicElement>(true, []);
    this.selectionCell = new SelectionModel<any>(true, []);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${
      this.selection.isSelected(row) ? 'deselect' : 'select'
    } row ${row.position + 1}`;
  }
}

/**  Copyright 2019 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */
