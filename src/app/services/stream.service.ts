import {
	collection,
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
	from,
	Observable,
	of,
	take,
	throwError
} from 'rxjs';
import { servers } from 'src/app/configuration/server';

import { Injectable } from '@angular/core';
import { addDoc, collectionData, deleteDoc, docData, Firestore } from '@angular/fire/firestore';
import { FollowService } from '@services/follow.service';
import { UserService } from '@services/user.service';

@Injectable({
	providedIn: 'root'
})
export class StreamService {
	private pc!: RTCPeerConnection;

	private streamerStream!: MediaStream;
	private viewStream!: MediaStream;

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

	initStream(roomId: string): Observable<MediaStream> {
		this.pc = new RTCPeerConnection(servers);
		this.registerPeerConnectionListeners();
		return this.userService.currentUser$.pipe(
			take(1),
			concatMap(currentUser => {
				if (!currentUser) throw new Error('Not Authenticated!');

				if (roomId === currentUser.uid) return this.createRoom(roomId);
				return this.joinRoomById(roomId);
			})
		);
	}

	createRoom(roomId: string): Observable<MediaStream> {
		return from(this.initStreamer()).pipe(
			catchError(error => throwError(() => console.log('Room Creation Failed:', error))),
			concatMap(async () => {
				this.addLocalTracks();
				this.addIceCandidateEventListener('offerCandidates', roomId);
				await this.saveRoom(roomId);
				this.addRoomListener(roomId);
				this.listenCandidates('answerCandidate', roomId);
				console.log('Room Created...');
				return this.streamerStream;
			}),

		);
	}

	joinRoomById(roomId: string): Observable<MediaStream> {
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
				return this.viewStream;
			})
		);
	}

	addIceCandidateEventListener(collectionName: string, roomId: string): void {
		const candidateRef = collection(this.firestore, 'rooms', roomId, collectionName);

		this.pc.addEventListener('icecandidate', event => {
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
					this.pc.addIceCandidate(candidate);
				}
			});
		});
	}

	collectIceCandidatesLocal(roomId: string): void {
		const localCandidateRef = collection(this.firestore, 'rooms', roomId, 'offerCandidates');

		this.pc.addEventListener('icecandidate', event => {
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
					this.pc.addIceCandidate(candidate);
				}
			});
		});
	}

	collectIceCandidatesRemote(roomId: string): void {
		const answerCandidates = collection(this.firestore, 'rooms', roomId, 'answerCandidates');

		this.pc.addEventListener('icecandidate', event => {
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
					this.pc.addIceCandidate(candidate);
				}
			});
		});
	}

	stopStream(roomId?: string): void {
		console.log('Exiting room...');

		this.stopLocalTracks();

		if (this.viewStream) {
			this.viewStream.getTracks().forEach(track => track.stop());
		}

		if (this.pc) this.pc.close();

		if (roomId) {
			this.deleteRoom(roomId)
		}
	}

	deleteRoom(roomId: string): Observable<void> {

		// TODO: delete candidates and chat collections
		const roomRef = doc(this.firestore, 'rooms', roomId);
		const answerCandidatesRef = collection(this.firestore, 'rooms', roomId, 'answerCandidates');
		const offerCandidatesRef = collection(this.firestore, 'rooms', roomId, 'offerCandidates');
		const chatRef = collection(this.firestore, 'rooms', roomId, 'chat');

		collectionData(query(answerCandidatesRef), { idField: 'id' })
			.pipe(take(1))
			.subscribe(docs => {
				docs.forEach(doc => deleteDoc(doc['id']))
			})

		console.log('Removing Room from database...');
		return from(deleteDoc(roomRef));
	}

	getChat(roomId: string): Observable<any[]> {
		const ref = collection(this.firestore, 'rooms', roomId, 'chat');
		const queryAll = query(ref, orderBy('date', 'asc'));
		return collectionData(queryAll) as Observable<any[]>;
	}

	addMessage(roomId: string, message: string): Observable<any> {
		const ref = collection(this.firestore, 'rooms', roomId, 'chat');
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
		await this.pc.setRemoteDescription(offer);
		const answerDescription = await this.pc.createAnswer();
		await this.pc.setLocalDescription(answerDescription);
		const answer = {
			sdp: answerDescription.sdp,
			type: answerDescription.type
		};
		await updateDoc(roomRef, { answer });
	}

	private addRemoteTracks(): void {
		this.pc.addEventListener('track', event => {
			console.log('Got remote track:', event.streams[0]);
			event.streams[0].getTracks().forEach(track => {
				console.log('Add a track to the remoteStream:', track);
				this.viewStream.addTrack(track);
			});
		});
	}

	private async initStreamer(): Promise<void> {
		console.log('Init streamer');
		this.streamerStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
	}

	private async saveRoom(streamId: string): Promise<void> {
		const offerDescription = await this.pc.createOffer();
		await this.pc.setLocalDescription(offerDescription);
		const offer = {
			sdp: offerDescription.sdp,
			type: offerDescription.type
		};
		const roomRef = doc(this.firestore, 'rooms', streamId);
		await setDoc(roomRef, { offer }).then(() =>
			console.log(`Offer has been saved. id=${streamId}, offer=${offerDescription}`)
		);
	}

	private addLocalTracks(): void {
		this.streamerStream.getTracks().forEach(track => {
			console.log('Add track:', track);
			this.pc.addTrack(track, this.streamerStream);
		});
	}

	private stopLocalTracks(): void {
		this.streamerStream?.getTracks()?.forEach(track => {
			track.stop();
		});
	}

	private addRoomListener(streamId: string): void {
		const roomRef = doc(this.firestore, 'rooms', streamId);
		onSnapshot(roomRef, async snapshot => {
			console.log('Got updated stream:', snapshot.data());
			const data = snapshot.data();
			if (!this.pc.currentRemoteDescription && data?.['answer']) {
				console.log('Set remote description: ', data['answer']);
				const answer = new RTCSessionDescription(data['answer']);
				await this.pc.setRemoteDescription(answer);
			}
		});
	}

	get peerConnection() {
		return this.pc;
	}
}
