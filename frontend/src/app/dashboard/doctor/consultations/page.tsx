'use client';

import { redirect } from 'next/navigation';

// The "Insights" sidebar link used to point here; redirect to the Patient Analytics page.
export default function ConsultationsRedirectPage() {
  redirect('/dashboard/doctor/patients');
}
