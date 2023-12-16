

import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BaseComponent } from '@components/base/base.component';
import { StreamService } from '@services/stream.service';
import { UserService } from '@services/user.service';
import { takeUntil } from 'rxjs';

@Component({
    selector: 'live-chat',
    templateUrl: './live-chat.component.html',
    styleUrls: ['./live-chat.component.css']
})
export class LiveChatComponent extends BaseComponent implements OnInit {
    @ViewChild('endOfChat') endOfChat!: ElementRef;
    @Input() messages: any[] = [];

    messageControl = new FormControl('');

    currentUser$ = this.userService.currentUser$;

    constructor(
        private readonly streamService: StreamService,
        private readonly userService: UserService
    ) {
        super();
    }

    ngOnInit(): void {
    }

    sendMessage(): void {
        const message = this.messageControl.value;
        this.streamService.addMessage(message)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                () => this.scrollToBottom()
            );
        this.messageControl.setValue('');
    }

    scrollToBottom(): void {
        setTimeout(() => {
            if (!this.endOfChat) return;
            this.endOfChat.nativeElement.scrollIntoView({ behavior: 'smooth' });
        }, 100)
    }

}
