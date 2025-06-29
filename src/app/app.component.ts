import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from './services/ticket.service';
import { Ticket } from './models/ticket.model';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
// import { BrowserModule } from '@angular/platform-browser';
// import { AppRoutingModule } from './app-routing.module';


declare var bootstrap: any;

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,   // ✅ Required for formGroup
    CommonModule,
    // HttpClientModule,
    // AppRoutingModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  ticketForm: FormGroup;
  tickets: Ticket[] = [];
  availableTags: string[] = [];
  showCreateForm = false;
  editingTicket: Ticket | null = null;
  selectedTicket: Ticket | null = null;
  tagsInput = '';
  
  descriptionFile: File | null = null;
  stepsFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService
  ) {
    this.ticketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['Open'],
      stepsToResolve: [''],
      assigneeName: [''],
      timeTaken: [0],
      clientEmail: [''],
      raisedByName: [''],
      sendEmail: [true]
    });
  }

  ngOnInit() {
    this.loadTickets();
    this.loadAvailableTags();
  }

  loadTickets() {
    this.ticketService.getAllTickets().subscribe(tickets => {
      this.tickets = tickets;
    });
  }

  loadAvailableTags() {
    this.ticketService.getUniqueTags().subscribe(tags => {
      this.availableTags = tags;
    });
  }

  onTagsInput(event: any) {
    this.tagsInput = event.target.value;
  }

  onFileSelect(event: any, type: 'description' | 'steps') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'description') {
        this.descriptionFile = file;
      } else {
        this.stepsFile = file;
      }
    }
  }

  onSubmit() {
    if (this.ticketForm.valid) {
      const formData = new FormData();
      
      // Add form fields
      Object.keys(this.ticketForm.value).forEach(key => {
        if (this.ticketForm.value[key] !== null && this.ticketForm.value[key] !== '') {
          formData.append(key, this.ticketForm.value[key]);
        }
      });

      // Add tags
      if (this.tagsInput.trim()) {
        const tags = this.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
        formData.append('tags', JSON.stringify(tags));
      }

      // Add files
      if (this.descriptionFile) {
        formData.append('descriptionAttachment', this.descriptionFile);
      }
      if (this.stepsFile) {
        formData.append('stepsAttachment', this.stepsFile);
      }

      if (this.editingTicket) {
        this.ticketService.updateTicket(this.editingTicket.id!, formData).subscribe(() => {
          this.loadTickets();
          this.resetForm();
        });
      } else {
        this.ticketService.createTicket(formData).subscribe(() => {
          this.loadTickets();
          this.resetForm();
        });
      }
    }
  }

  editTicket(ticket: Ticket) {
    this.editingTicket = ticket;
    this.showCreateForm = true;
    
    this.ticketForm.patchValue({
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      stepsToResolve: ticket.stepsToResolve,
      assigneeName: ticket.assigneeName,
      timeTaken: ticket.timeTaken,
      clientEmail: ticket.clientEmail,
      raisedByName: ticket.raisedByName,
      sendEmail: ticket.sendEmail
    });

    if (ticket.tags) {
      this.tagsInput = ticket.tags.join(', ');
    }
  }

  viewTicket(ticket: Ticket) {
    this.selectedTicket = ticket;
    const modal = new bootstrap.Modal(document.getElementById('ticketModal'));
    modal.show();
  }

  resetForm() {
    this.ticketForm.reset({
      status: 'Open',
      sendEmail: true,
      timeTaken: 0
    });
    this.tagsInput = '';
    this.showCreateForm = false;
    this.editingTicket = null;
    this.descriptionFile = null;
    this.stepsFile = null;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Open': return 'bg-primary';
      case 'In Progress': return 'bg-warning';
      case 'Resolved': return 'bg-success';
      case 'Closed': return 'bg-secondary';
      default: return 'bg-light';
    }
  }
}