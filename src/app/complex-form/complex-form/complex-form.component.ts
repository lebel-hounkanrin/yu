import { ComplexFormService } from './../services/complex-form.service';
import { Observable, map, startWith, tap } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-complex-form',
  templateUrl: './complex-form.component.html',
  styleUrls: ['./complex-form.component.scss']
})
export class ComplexFormComponent implements OnInit {
  mainForm!: FormGroup;
  personalInfoForm!: FormGroup;
  contactPreferenceCtrl!: FormControl;
  phoneCtrl!: FormControl;
  emailCtrl!: FormControl;
  confirmEmailCtrl!: FormControl;
  emailForm!: FormGroup;
  passwordCtrl!: FormControl;
  confirmPasswordCtrl!: FormControl;
  loginInfoForm!: FormGroup;

  showEmailCtrl$!: Observable<boolean>;
  showPhoneCtrl$!: Observable<boolean>;

  loading = false;
  constructor(private formBuilder: FormBuilder, private complexFormService: ComplexFormService) { }

  ngOnInit(): void {
    this.initFormControls();
    this.initMainForm();
    this.initFormControls()
    this.initFormObservables()
  }
  private initMainForm(): void {
    this.mainForm = this.formBuilder.group({
        personalInfo: this.personalInfoForm,
        contactPreference: this.contactPreferenceCtrl,
        email: this.emailForm,
        phone: this.phoneCtrl,
        loginInfo: this.loginInfoForm
    });
}
  private initFormControls(): void {
    this.personalInfoForm = this.formBuilder.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
    });
    this.contactPreferenceCtrl = this.formBuilder.control('email');
    this.phoneCtrl = this.formBuilder.control('');

    this.emailCtrl = this.formBuilder.control('');
    this.confirmEmailCtrl = this.formBuilder.control('');
    this.emailForm = this.formBuilder.group({
        email: this.emailCtrl,
        confirm: this.confirmEmailCtrl
    });
    this.passwordCtrl = this.formBuilder.control('', Validators.required);
    this.confirmPasswordCtrl = this.formBuilder.control('', Validators.required);
    this.loginInfoForm = this.formBuilder.group({
    username: ['', Validators.required],
    password: this.passwordCtrl,
    confirmPassword: this.confirmPasswordCtrl
});
}

private initFormObservables() {
  this.showEmailCtrl$ = this.contactPreferenceCtrl.valueChanges.pipe(
      startWith(this.contactPreferenceCtrl.value),
      map(preference => preference === 'email'),
      tap(showEmailCtrl => this.setEmailValidators(showEmailCtrl))
  );
  this.showPhoneCtrl$ = this.contactPreferenceCtrl.valueChanges.pipe(
      startWith(this.contactPreferenceCtrl.value),
      map(preference => preference === 'phone'),
      tap(showPhoneCtrl => this.setPhoneValidators(showPhoneCtrl))
  );
}

private setEmailValidators(showEmailCtrl: boolean) {
  if (showEmailCtrl) {
      this.emailCtrl.addValidators([
          Validators.required,
          Validators.email
      ]);
      this.confirmEmailCtrl.addValidators([
          Validators.required,
          Validators.email
      ]);
  } else {
      this.emailCtrl.clearValidators();
      this.confirmEmailCtrl.clearValidators();
  }
  this.emailCtrl.updateValueAndValidity();
  this.confirmEmailCtrl.updateValueAndValidity();
}

private setPhoneValidators(showPhoneCtrl: boolean) {
  if (showPhoneCtrl) {
      this.phoneCtrl.addValidators([
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10)
      ]);
  } else {
      this.phoneCtrl.clearValidators();
  }
  this.phoneCtrl.updateValueAndValidity();
}

getFormControlErrorText(ctrl: AbstractControl) {
  if (ctrl.hasError('required')) {
    return 'Ce champ est requis';
} else if (ctrl.hasError('email')) {
    return 'Merci d\'entrer une adresse mail valide';
} else if (ctrl.hasError('minlength')) {
    return 'Ce numéro de téléphone ne contient pas assez de chiffres';
} else if (ctrl.hasError('maxlength')) {
    return 'Ce numéro de téléphone contient trop de chiffres';
} else {
    return 'Ce champ contient une erreur';
}
}
  onSubmitForm(){
    this.loading = true;
    console.log(this.mainForm.value)
    this.complexFormService.saveUserInfo(this.mainForm.value).pipe(
      tap(saved => {
          this.loading = false;
          if (saved) {
    this.mainForm.reset();
    this.contactPreferenceCtrl.patchValue('email');
    } else {
    console.error('Echec de l\'enregistrement');
}
      })
  ).subscribe();
  }
}
