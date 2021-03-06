import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Unit } from 'src/app/core/models/unit.model';
import { Observable } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { DatabaseService } from 'src/app/core/services/database.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-product-config-units',
  templateUrl: './product-config-units.component.html',
  styleUrls: ['./product-config-units.component.scss']
})
export class ProductConfigUnitsComponent implements OnInit {
  units$: Observable<Unit[]>
  units: Unit[] = [];

  unitFormGroup: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<ProductConfigUnitsComponent>,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.units$ = this.dbs.getProductsListUnitsValueChanges()
      .pipe(take(1),tap(unitList => {this.units = unitList}))

    this.unitFormGroup = this.fb.group({
      description: ["", [Validators.required, this.repeatedUnitDesc()]],
      abbreviation: ["", [Validators.required, this.repeatedUnitAbbv()]],
      weight: ["", [Validators.required, Validators.min(0.01), Validators.max(3.5)]],
    })
  }



  addUnit(){
    let unit: Unit = {
      abbreviation: this.unitFormGroup.get('abbreviation').value.trim().toLowerCase(),
      description: this.unitFormGroup.get('description').value.trim().toLowerCase(),
      weight: this.unitFormGroup.get('weight').value
    }
    this.units.unshift(unit);
    this.unitFormGroup.reset();
    this.unitFormGroup.markAsUntouched()
  }

  deleteUnit(unit: Unit){
    this.units = this.units.filter(cat => cat != unit);
  }
  
  onSubmitForm(){
    this.unitFormGroup.markAsPending();
    this.dbs.editUnits(this.units, false).commit().then(
      res => {
        this.snackBar.open('Las unidades se editaron con éxito', 'Aceptar');
        this.dialogRef.close()
      },
      res => {
        this.snackBar.open('Ocurrió un error. Vuelva a Intentarlo', 'Aceptar')
      }
    )
  }

  repeatedUnitDesc(){
    return (control: AbstractControl): {[s: string]: boolean} => {
      if(control.value){
        let value = control.value.trim().toUpperCase();
        let valid = !this.units.find(unit => unit.description.trim().toUpperCase() == value);
        return valid ? null : {repeated: true}
      }
      else{
        return null
      }
    }
  }
  repeatedUnitAbbv(){
    return (control: AbstractControl): {[s: string]: boolean} => {
      if(control.value){
        let value = control.value.trim().toUpperCase();
        let valid = !this.units.find(unit => unit.abbreviation.trim().toUpperCase() == value);
        return valid ? null : {repeated: true}
      }
      else{
        return null
      }
    }
  }
}
