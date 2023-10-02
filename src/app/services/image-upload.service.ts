import { Injectable } from '@angular/core';
import { Storage, getDownloadURL, ref } from '@angular/fire/storage';
import { uploadBytes } from 'firebase/storage';
import { Observable, from, switchMap } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ImageUploadService {

	constructor(private readonly storage: Storage) { }

	uploadImage(image: File, path: string): Observable<string> {
		const storageRef = ref(this.storage, path);
		const uploadTask = from(uploadBytes(storageRef, image));
		return uploadTask.pipe(
			switchMap((result) => getDownloadURL(result.ref))
		);
	}
}
