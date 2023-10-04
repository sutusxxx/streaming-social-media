import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { passwordValidator } from 'src/app/validators/password-validator';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  registrationForm = new FormGroup({
    displayName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    gender: new FormControl('', Validators.required),
    age: new FormControl('', Validators.required)
  }, { validators: passwordValidator() });

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
  }

  registration(): void {
    if (!this.registrationForm.valid) return;

    const { name, email, password, } = this.registrationForm.value;
    this.authService.registration(email, password).pipe(
      switchMap(({ user: { uid } }) => this.userService.createUser({ uid, email, displayName: name.toLowerCase() }))
    )
      .subscribe(() => {
        this.router.navigate(['/home']);
      });
  }

  get displayName() {
    return this.registrationForm.get('displayName');
  }

  get email() {
    return this.registrationForm.get('email');
  }

  get password() {
    return this.registrationForm.get('password');
  }

  get confirmPassword() {
    return this.registrationForm.get('confirmPassword');
  }

  get firstName() {
    return this.registrationForm.get('firstName');
  }

  get lastName() {
    return this.registrationForm.get('lastName');
  }

  get age() {
    return this.registrationForm.get('age');
  }

  get gender() {
    return this.registrationForm.get('gender');
  }
}
