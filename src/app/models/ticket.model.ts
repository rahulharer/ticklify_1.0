export interface Ticket {
    id?: number;
    title: string;
    description: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    stepsToResolve?: string;
    assigneeName?: string;
    tags?: string[];
    timeTaken?: number;
    clientEmail?: string;
    raisedByName?: string;
    descriptionAttachment?: string;
    stepsAttachment?: string;
    sendEmail?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }