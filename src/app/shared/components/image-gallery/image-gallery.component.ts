// src/app/shared/components/image-gallery/image-gallery.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../base/base-component';

export interface GalleryImage {
  id: string;
  src: string;
  alt?: string;
  thumbnail?: string;
  caption?: string;
}

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html'
})
export class ImageGalleryComponent extends BaseComponent {
  @Input() images: GalleryImage[] = [];
  @Input() columns: 1 | 2 | 3 | 4 = 3;
  @Input() showThumbnails: boolean = true;
  @Input() showCaption: boolean = true;

  @Output() imageClick = new EventEmitter<GalleryImage>();

  selectedImage: GalleryImage | null = null;
  lightboxOpen: boolean = false;

  ngOnInit() {
    super.ngOnInit();
    if (this.images.length > 0) {
      this.selectedImage = this.images[0];
    }
  }

  selectImage(image: GalleryImage): void {
    this.selectedImage = image;
  }

  openLightbox(image: GalleryImage): void {
    this.selectImage(image);
    this.lightboxOpen = true;
    this.imageClick.emit(image);
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
  }

  nextImage(): void {
    if (!this.selectedImage) return;

    const currentIndex = this.images.findIndex(img => img.id === this.selectedImage?.id);
    const nextIndex = (currentIndex + 1) % this.images.length;
    this.selectedImage = this.images[nextIndex];
  }

  prevImage(): void {
    if (!this.selectedImage) return;

    const currentIndex = this.images.findIndex(img => img.id === this.selectedImage?.id);
    const prevIndex = (currentIndex - 1 + this.images.length) % this.images.length;
    this.selectedImage = this.images[prevIndex];
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.lightboxOpen) return;

    switch (event.key) {
      case 'ArrowRight':
        this.nextImage();
        break;
      case 'ArrowLeft':
        this.prevImage();
        break;
      case 'Escape':
        this.closeLightbox();
        break;
    }
  }
}