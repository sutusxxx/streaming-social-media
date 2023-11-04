import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostGridComponent } from './post-grid.component';

describe('PostGridComponent', () => {
  let component: PostGridComponent;
  let fixture: ComponentFixture<PostGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
