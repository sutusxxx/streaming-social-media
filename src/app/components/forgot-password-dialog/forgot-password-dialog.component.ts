import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@services/auth.service';
import { catchError, of, throwError } from 'rxjs';

@Component({
	selector: 'app-forgot-password-dialog',
	templateUrl: './forgot-password-dialog.component.html',
	styleUrls: ['./forgot-password-dialog.component.css']
})
export class ForgotPasswordDialogComponent implements OnInit {
	email?: string;

	userNotFoundError: boolean = false;

	constructor(
		private readonly authService: AuthService,
		private dialogRef: MatDialogRef<ForgotPasswordDialogComponent>
	) { }

	ngOnInit(): void {
	}

	sendEmail(): void {
		if (!this.email) return;

		this.authService.resetPasswordByEmail(this.email).pipe(
			catchError(error => {
				this.userNotFoundError = true;
				return throwError(() => new Error('User Not Found!'))
			})
		).subscribe(() => this.dialogRef.close(this.email));
	}
}
