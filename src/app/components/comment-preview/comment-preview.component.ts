import { PATH } from 'src/app/constants/path.constant';

import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PostService } from '@services/post.service';
import { Observable, of, take } from 'rxjs';
import { IComment } from 'src/app/interfaces/comment.interface';

@Component({
  selector: 'comment-preview',
  templateUrl: './comment-preview.component.html',
  styleUrls: ['./comment-preview.component.css']
})
export class CommentPreviewComponent implements OnInit {
  @Input() postId: string = '';
  commentControl = new FormControl('');

  comments$: Observable<IComment[]> | null = null;

  readonly PATH = PATH;

  constructor(
    private readonly postService: PostService
  ) { }

  ngOnInit(): void {
    this.comments$ = this.postService.getPostCommentPreview$(this.postId);
  }

  sendComment(): void {
    const comment = this.commentControl.value;
    if (!comment) return;

    this.postService.addComment(this.postId, comment)
      .subscribe();
    this.commentControl.setValue('');
  }
}
