import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { SCROLL_POSITION_BOTTOM, SCROLL_POSITION_TOP } from '../constants/scroll-position.constant';

@Directive({
	selector: '[scrollable]'
})
export class ScrollableDirective {
	@Output() scrollPosition = new EventEmitter();

	constructor(public el: ElementRef) { }

	@HostListener('scroll', ['$event'])
	onScroll(event: any): void {
		try {
			const top = event.target.scrollTop;
			const height = this.el.nativeElement.scrollHeight;
			const offset = this.el.nativeElement.offsetHeight;

			if (top > height - offset - 100) {
				this.el.nativeElement.scrollTop -= 100;
				this.scrollPosition.emit(SCROLL_POSITION_BOTTOM);
			}

			if (top === 0) {
				this.scrollPosition.emit(SCROLL_POSITION_TOP);
			}
		} catch (error) {

		}
	}
}
