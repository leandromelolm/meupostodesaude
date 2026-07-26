import { Component, HostListener } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-menu-desktop',
  standalone: true,
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './menu-desktop.component.html',
  styleUrl: './menu-desktop.component.css'
})
export class MenuDesktopComponent {
  isScrolled = false;
  isHidden = false;
  private lastScrollPosition = 0;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScroll = window.scrollY || document.documentElement.scrollTop;

    if (currentScroll > 100) {
      this.isScrolled = true;

      if (currentScroll > this.lastScrollPosition) {
        this.isHidden = true;
      } else {
        this.isHidden = false;
      }
    } else {
      this.isScrolled = false;
      this.isHidden = false;
    }

    this.lastScrollPosition = currentScroll;
  }
}