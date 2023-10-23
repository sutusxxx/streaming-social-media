import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { PATH } from 'src/app/constants/path.constant';
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
    gender: new FormControl(''),
    dateOfBirth: new FormControl('')
  }, { validators: passwordValidator() });

  genders: string[] = [
    'Male',
    'Femaile'
  ];

  PATH = PATH;

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

  get dateOfBirth() {
    return this.registrationForm.get('dateOfBirth');
  }

  get gender() {
    return this.registrationForm.get('gender');
  }
}
