import {
	collection,
	CollectionReference,
	doc,
	DocumentData,
	DocumentReference,
	onSnapshot,
	orderBy,
	query,
	setDoc,
	Timestamp,
	updateDoc
} from 'firebase/firestore';
import {
	catchError,
	combineLatest,
	concatMap,
	EMPTY,
	forkJoin,
	Observable,
	of,
	take,
	throwError
} from 'rxjs';
import { servers } from 'src/app/configuration/server';
import { IRoom } from 'src/app/interfaces/room.interface';
import { User } from 'src/app/models';

import { Injectable } from '@angular/core';
import {
	addDoc,
	collectionData,
	deleteDoc,
	docData,
	Firestore,
	getDocs
} from '@angular/fire/firestore';
import { FollowService } from '@services/follow.service';
import { UserService } from '@services/user.service';

@Injectable({
	providedIn: 'root'
})
export class StreamService {
	private pc: RTCPeerConnection | null = null;

	private streamerStream: MediaStream | null = null;
	private viewStream: MediaStream | null = null;

	private roomId: string | null = null;

	constructor(
		private readonly firestore: Firestore,
		private readonly userService: UserService,
		private readonly followService: FollowService
	) { }

	private registerPeerConnectionListeners() {
		this.peerConnection.addEventListener('icegatheringstatechange', () => {
			console.log(
				`ICE gathering state changed: ${this.peerConnection.iceGatheringState}`);
		});

		this.peerConnection.addEventListener('connectionstatechange', () => {
			console.log(`Connection state change: ${this.peerConnection.connectionState}`);
		});

		this.peerConnection.addEventListener('signalingstatechange', () => {
			console.log(`Signaling state change: ${this.peerConnection.signalingState}`);
		});

		this.peerConnection.addEventListener('iceconnectionstatechange ', () => {
			console.log(
				`ICE connection state change: ${this.peerConnection.iceConnectionState}`);
		});
	}

	getRooms(): Observable<IRoom[]> {
		const ref: CollectionReference<DocumentData> = collection(this.firestore, 'rooms');
		return collectionData(query(ref), { idField: 'id' }) as Observable<IRoom[]>;
	}

	initPeerConnection(): void {
		this.pc = new RTCPeerConnection(servers);
		this.registerPeerConnectionListeners();
	}

	createRoom(): Observable<MediaStream | null> {
		return this.userService.currentUser$.pipe(
			catchError(error => throwError(() => console.log('Room Creation Failed:', error))),
			concatMap(async currentUser => {
				if (!currentUser) return null;

				this.streamerStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
				this.addLocalTracks();

				this.roomId = await this.addRoom(currentUser);

				this.addIceCandidateEventListener('offerCandidates', this.roomId);

				await this.saveRoomData(this.roomId);
				this.addRoomListener(this.roomId);

				this.listenCandidates('answerCandidate', this.roomId);

				console.log('Room Created...');

				return this.localStream;
			})
		);
	}

	joinRoomById(roomId: string): Observable<MediaStream | null> {
		this.viewStream = new MediaStream();
		const roomRef = doc(this.firestore, 'rooms', roomId);
		return docData(roomRef).pipe(
			take(1),
			catchError(error => throwError(() => console.log('Failed To Join:', error))),
			concatMap(async room => {
				if (!room) throw new Error('Room Not Found!');
				this.addRemoteTracks();
				this.addIceCandidateEventListener('answerCandidates', roomId)
				const offer = room['offer'];
				await this.createSDPAnswer(offer, roomRef);
				this.listenCandidates('offerCandidates', roomId);
				console.log('Room Joined...');
				this.roomId = roomId;
				return this.viewStream;
			})
		);
	}

	addIceCandidateEventListener(collectionName: string, roomId: string): void {
		const candidateRef = collection(this.firestore, 'rooms', roomId, collectionName);

		this.peerConnection.addEventListener('icecandidate', event => {
			if (!event.candidate) return;
			console.log('Save Candidate:', event.candidate);
			addDoc(candidateRef, event.candidate.toJSON());
		});
	}

	listenCandidates(collectionName: string, roomId: string): void {
		const candidateRef = collection(this.firestore, 'rooms', roomId, collectionName);
		onSnapshot(candidateRef, snapshot => {
			snapshot.docChanges().forEach(change => {
				if (change.type === 'added') {
					const candidate = new RTCIceCandidate(change.doc.data());
					console.log('Add ICE Candidate:', candidate);
					this.peerConnection.addIceCandidate(candidate);
				}
			});
		});
	}

	collectIceCandidatesLocal(roomId: string): void {
		const localCandidateRef = collection(this.firestore, 'rooms', roomId, 'offerCandidates');

		this.peerConnection.addEventListener('icecandidate', event => {
			if (!event.candidate) return;
			console.log('Save Candidate:', event.candidate);
			addDoc(localCandidateRef, event.candidate.toJSON());
		});

		const remoteCandidateRef = collection(this.firestore, 'rooms', roomId, 'answerCandidates');
		onSnapshot(remoteCandidateRef, snapshot => {
			snapshot.docChanges().forEach(change => {
				if (change.type === 'added') {
					const candidate = new RTCIceCandidate(change.doc.data());
					console.log('Add ICE Candidate:', candidate);
					this.peerConnection.addIceCandidate(candidate);
				}
			});
		});
	}

	collectIceCandidatesRemote(roomId: string): void {
		const answerCandidates = collection(this.firestore, 'rooms', roomId, 'answerCandidates');

		this.peerConnection.addEventListener('icecandidate', event => {
			if (!event.candidate) return;
			console.log('Save Candidate:', event.candidate);
			addDoc(answerCandidates, event.candidate.toJSON());
		});

		const offerCandidates = collection(this.firestore, 'rooms', roomId, 'offerCandidates');
		onSnapshot(offerCandidates, snapshot => {
			snapshot.docChanges().forEach(change => {
				if (change.type === 'added') {
					const candidate = new RTCIceCandidate(change.doc.data());
					console.log('Add ICE Candidate:', candidate);
					this.peerConnection.addIceCandidate(candidate);
				}
			});
		});
	}

	async stopStream(isHost: boolean): Promise<void> {
		console.log('Exiting room...');

		this.stopLocalTracks();

		if (this.viewStream) {
			this.viewStream.getTracks().forEach(track => track.stop());
		}

		if (this.pc) this.pc.close();


		if (isHost) {
			await this.deleteRoom();
		}
	}

	async deleteRoom(): Promise<void> {
		if (!this.room) return;

		const roomId = this.room;
		const answerCandidateSnapshot = await getDocs(collection(this.firestore, 'rooms', roomId, 'answerCandidates'));
		answerCandidateSnapshot.forEach(async docData => {
			const ref = doc(this.firestore, 'rooms', roomId, 'answerCandidates', docData.id);
			await deleteDoc(ref);
		});

		const offerCandidateSnapshot = await getDocs(collection(this.firestore, 'rooms', roomId, 'offerCandidates'));
		offerCandidateSnapshot.forEach(async docData => {
			const ref = doc(this.firestore, 'rooms', roomId, 'offerCandidates', docData.id);
			await deleteDoc(ref);
		});

		const chatSnapshot = await getDocs(collection(this.firestore, 'rooms', roomId, 'chat'));
		chatSnapshot.forEach(async docData => {
			const ref = doc(this.firestore, 'rooms', roomId, 'chat', docData.id);
			await deleteDoc(ref);
		});

		console.log(`Removing Room with ID: "${roomId}" from database...`);
		const roomRef = doc(this.firestore, 'rooms', roomId);
		await deleteDoc(roomRef);
	}

	getChat(): Observable<any[]> {
		if (!this.roomId) return of([]);
		const ref = collection(this.firestore, 'rooms', this.roomId, 'chat');
		const queryAll = query(ref, orderBy('date', 'asc'));
		return collectionData(queryAll) as Observable<any[]>;
	}

	addMessage(message: string): Observable<any> {
		if (!this.roomId) return of();
		const ref = collection(this.firestore, 'rooms', this.roomId, 'chat');
		const date = Timestamp.fromDate(new Date());
		return this.userService.currentUser$.pipe(
			take(1),
			concatMap(user => {
				return addDoc(ref, {
					text: message,
					senderId: user?.uid,
					senderName: user?.displayName,
					date: date
				});
			})
		);
	}

	sendLiveStartedNotificationToFollowers(): Observable<any> {
		return this.userService.currentUser$.pipe(
			concatMap(user => {
				if (!user) return throwError(() => 'Not Authenticated');
				return combineLatest([of(user), this.followService.getFollowers(user.uid)]);
			}),
			concatMap(([user, followers]) => {
				if (!followers || !followers.length) return EMPTY;
				const notificationMessage = `${user.displayName} is LIVE!`
				return forkJoin(followers.map((followerId: string) => this.userService.notifyUser(followerId, notificationMessage)))
			})
		);
	}

	private async createSDPAnswer(offer: any, roomRef: DocumentReference<DocumentData>): Promise<void> {
		await this.peerConnection.setRemoteDescription(offer);
		const answerDescription = await this.peerConnection.createAnswer();
		await this.peerConnection.setLocalDescription(answerDescription);
		const answer = {
			sdp: answerDescription.sdp,
			type: answerDescription.type
		};
		await updateDoc(roomRef, { answer });
	}

	private addRemoteTracks(): void {
		this.peerConnection.addEventListener('track', event => {
			console.log('Got remote track:', event.streams[0]);
			event.streams[0].getTracks().forEach(track => {
				console.log('Add a track to the remoteStream:', track);
				this.remoteStream.addTrack(track);
			});
		});
	}

	private async addRoom(user: User): Promise<string> {
		const host = {
			id: user.uid,
			name: user.displayName,
			photoURL: user.photoURL,
			date: Timestamp.fromDate(new Date())
		};
		const roomRef = await addDoc(collection(this.firestore, 'rooms'), { host });
		console.log('Room created with id:', roomRef.id);
		return roomRef.id;
	}

	private async saveRoomData(roomId: string): Promise<void> {
		const offerDescription = await this.peerConnection.createOffer();
		await this.peerConnection.setLocalDescription(offerDescription);
		const offer = {
			sdp: offerDescription.sdp,
			type: offerDescription.type
		};

		const roomRef = doc(this.firestore, 'rooms', roomId);
		await setDoc(roomRef, { offer }, { merge: true }).then(() =>
			console.log(`Offer has been saved. id=${roomId}, offer=${offerDescription}`)
		);
	}

	private addLocalTracks(): void {
		this.localStream.getTracks().forEach(track => {
			console.log('Add track:', track);
			this.peerConnection.addTrack(track, this.localStream);
		});
	}

	private stopLocalTracks(): void {
		this.localStream.getTracks()?.forEach(track => {
			track.stop();
		});
	}

	private addRoomListener(streamId: string): void {
		const roomRef = doc(this.firestore, 'rooms', streamId);
		onSnapshot(roomRef, async snapshot => {
			if (!snapshot.data()) return;

			console.log('Got updated stream:', snapshot.data());
			const data = snapshot.data();
			if (data?.['answer'] && !this.peerConnection.currentRemoteDescription) {
				console.log('Set remote description: ', data['answer']);
				const answer = new RTCSessionDescription(data['answer']);
				await this.peerConnection.setRemoteDescription(answer);
			}
		});
	}

	get peerConnection() {
		if (!this.pc) throw new Error('RTCPeerConnection is not initialized!');

		return this.pc;
	}

	get localStream() {
		if (!this.streamerStream) throw new Error('Stream is not initialized!');

		return this.streamerStream;
	}

	get remoteStream() {
		if (!this.viewStream) throw new Error('Stream is not initialized!');

		return this.viewStream;
	}

	get room() {
		return this.roomId;
	}
}
