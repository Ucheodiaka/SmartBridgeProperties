import { AdminStaffAccount } from '../types';

export const DEMO_ADMIN_STAFF: AdminStaffAccount[] = [
  {
    id: 'staff-1',
    name: 'Engr. Tonye Amadi',
    email: 't.amadi@smartbridge.ng',
    role: 'Lead Field Inspector',
    badge: 'Structural & Flood Audit Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    pin: '1234',
  },
  {
    id: 'staff-2',
    name: 'Barrister Chioma Okon',
    email: 'c.okon@smartbridge.ng',
    role: 'Legal & Title Verifier',
    badge: 'Rivers Ministry C of O Desk',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    pin: '1234',
  },
  {
    id: 'staff-3',
    name: 'Dr. Kenneth Briggs',
    email: 'k.briggs@smartbridge.ng',
    role: 'Operations Director',
    badge: 'Executive Admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    pin: '1234',
  },
];

export const MASTER_ADMIN_PIN = '1234';
export const MASTER_ADMIN_PASSWORD = 'admin';
