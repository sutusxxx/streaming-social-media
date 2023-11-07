import { catchError, take, throwError } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@services/auth.service';

@Component({
	selector: 'app-forgot-password-dialog',
	templateUrl: './forgot-password-dialog.component.html',
	styleUrls: ['./forgot-password-dialog.component.css']
})
export class ForgotPasswordDialogComponent implements OnInit {
	emailForm: FormControl = new FormControl('', Validators.email);

	userNotFoundError: boolean = false;

	constructor(
		private readonly authService: AuthService,
		private dialogRef: MatDialogRef<ForgotPasswordDialogComponent>
	) { }

	ngOnInit(): void {
	}

	sendEmail(): void {
		if (!this.emailForm.value) return;

		const email = this.emailForm.value;
		this.authService.resetPasswordByEmail(email).pipe(
			take(1),
			catchError(error => {
				this.userNotFoundError = true;
				return throwError(() => new Error('User Not Found!'))
			})
		).subscribe(() => this.dialogRef.close(email));
	}
}
