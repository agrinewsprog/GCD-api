import { Request } from 'express';

// User types
export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithRoles extends User {
  roles: string[];
}

// Role types
export interface Role {
  id: number;
  name: 'admin' | 'comercial' | 'post-venta' | 'analista';
  created_at: Date;
}

// Company types
export interface Company {
  id: number;
  name: string;
  billing_address?: string;
  billing_postal_code?: string;
  billing_city?: string;
  billing_province?: string;
  billing_country?: string;
  tax_number?: string;
  iban?: string;
  created_at: Date;
  updated_at: Date;
}

// Contact types
export interface Contact {
  id: number;
  company_id: number;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

// Medium types
export interface Medium {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface MediumWithChannels extends Medium {
  channels: Channel[];
}

// Channel types
export interface Channel {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface ChannelWithActions extends Channel {
  actions: Action[];
}

export interface ChannelWithMediums extends Channel {
  mediums: Medium[];
}

export interface ActionWithChannels extends Action {
  channels: Channel[];
}

// Action types
export interface Action {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

// Campaign types
export interface Campaign {
  id: number;
  name: string;
  description?: string;
  company_id: number;
  contact_id: number;
  contract_file?: string;
  total_amount?: number;
  number_of_installments?: number;
  currency?: 'EUR' | 'USD' | 'BRL';
  billing_zone?: 'Spain' | 'Global' | 'Brazil';
  comments?: string;
  completed: boolean;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface CampaignMedium {
  id: number;
  campaign_id: number;
  medium_id: number;
  medium_name?: string;
  created_at: Date;
}

// Campaign Installment types
export interface CampaignInstallment {
  id: number;
  campaign_id: number;
  installment_number: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  paid_date?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// Campaign Action types
export interface CampaignAction {
  id: number;
  campaign_id: number;
  medium_id: number;
  channel_id: number;
  action_id: number;
  start_date?: string;
  end_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// Notification types
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  read_status: boolean;
  read_at?: Date;
  sent_email: boolean;
  created_at: Date;
  updated_at: Date;
}

// Newsletter types
export interface NewsletterType {
  id: number;
  medium_id: number;
  medium_name?: string;
  region: string;
  name: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  week_of_month: '1' | '2' | '3' | '4' | '5';
  frequency: 'monthly' | 'bimonthly' | 'quarterly';
  frequency_offset: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface NewsletterSchedule {
  id: number;
  newsletter_type_id: number;
  newsletter_name?: string;
  medium_name?: string;
  region?: string;
  scheduled_date: string; // YYYY-MM-DD
  year: number;
  month: number;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

// Auth types
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    roles: string[];
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  surname: string;
  email: string;
  password: string;
  roles: number[];
}
