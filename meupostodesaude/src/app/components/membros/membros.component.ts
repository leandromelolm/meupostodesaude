import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Membro } from '../../models/membro.model';
import { MembrosService } from '../../services/membros.service';

@Component({
  selector: 'app-membros',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './membros.component.html',
  styleUrl: './membros.component.css'
})
export class MembrosComponent implements OnInit {
  membros: Membro[] = [];

  constructor(private membrosService: MembrosService) { }

  ngOnInit(): void {
    this.membros = this.membrosService.getMembros();
  }
}
