import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './guards/auth.guard';
import { UserRole } from './enums/role.enums';

export const routes: Routes = [
  // Rutas de autenticación (sin guard)
  { 
    path: 'login', 
    canActivate: [loginGuard],
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'unauthorized', 
    loadComponent: () => import('./components/auth/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  // Ruta principal - Dashboard (requiere autenticación)
  { 
    path: '', 
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  { 
    path: 'dashboard', 
    canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // Gestión de Usuarios (requiere ADMIN o SUPERADMIN)
  {
    path: 'users',
    canActivate: [authGuard],
    data: { roles: [UserRole.ADMIN, UserRole.SUPERADMIN] },
    loadComponent: () => import('./components/users/user-list.component').then(m => m.UserListComponent)
  },

  // Gestión de Roles (requiere SUPERADMIN)
  {
    path: 'roles',
    canActivate: [authGuard],
    data: { roles: [UserRole.SUPERADMIN] },
    loadComponent: () => import('./components/roles/role-list.component').then(m => m.RoleListComponent)
  },

  // Rutas de laboratorio (requiere autenticación)
  { 
    path: 'lab-results',
    canActivate: [authGuard],
    loadComponent: () => import('./components/_delete/lab-results/lab-results.component').then(m => m.LabResultsComponent)
  },
  { 
    path: 'lab-result/:sampleNumber',
    canActivate: [authGuard],
    loadComponent: () => import('./components/_delete/lab-results/lab-result-detail.component').then(m => m.LabResultDetailComponent)
  },
  { 
    path: 'dymind-dh36-results',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dymind-dh36/dymind-dh36-results/dymind-dh36-results.component').then(m => m.DymindDh36ResultsComponent)
  },
  { 
    path: 'dymind-dh36-result/:sampleNumber',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dymind-dh36/dymind-dh36-result-detail/dymind-dh36-result-detail.component').then(m => m.DymindDh36ResultDetailComponent)
  },
  { 
    path: 'lab-ichroma',
    canActivate: [authGuard],
    loadComponent: () => import('./components/ichroma/lab-ichroma.component').then(m => m.LabIchromaComponent)
  },
  { 
    path: 'urine-tests',
    canActivate: [authGuard],
    loadComponent: () => import('./components/urine-tests/urine-test-list/urine-test-list.component').then(m => m.UrineTestListComponent)
  },
  { 
    path: 'urine-tests/new',
    canActivate: [authGuard],
    loadComponent: () => import('./components/urine-tests/urine-test-form/urine-test-form.component').then(m => m.UrineTestFormComponent)
  },
  { 
    path: 'urine-tests/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./components/urine-tests/urine-test-form/urine-test-form.component').then(m => m.UrineTestFormComponent)
  },
  { 
    path: 'urine-tests/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./components/urine-tests/urine-test-form/urine-test-form.component').then(m => m.UrineTestFormComponent)
  },
  { 
    path: 'stool-tests',
    canActivate: [authGuard],
    loadComponent: () => import('./components/stool-tests/stool-tests/stool-tests.component').then(m => m.StoolTestsComponent)
  },
  { 
    path: 'stool-tests/new',
    canActivate: [authGuard],
    loadComponent: () => import('./components/stool-tests/stool-test-form/stool-test-form.component').then(m => m.StoolTestFormComponent)
  },
  { 
    path: 'stool-tests/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./components/stool-tests/stool-test-detail/stool-test-detail.component').then(m => m.StoolTestDetailComponent)
  },
  { 
    path: 'stool-tests/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./components/stool-tests/stool-test-detail/stool-test-detail.component').then(m => m.StoolTestDetailComponent)
  },
  { 
    path: 'test-sections',
    canActivate: [authGuard],
    loadComponent: () => import('./components/test-sections/test-section-list/test-section-list.component').then(m => m.TestSectionListComponent)
  },
  { 
    path: 'test-definitions',
    canActivate: [authGuard],
    loadComponent: () => import('./components/test-definitions/test-definition-list/test-definition-list.component').then(m => m.TestDefinitionListComponent)
  },
  { 
    path: 'test-profiles',
    canActivate: [authGuard],
    loadComponent: () => import('./components/test-profiles/test-profile-list/test-profile-list.component').then(m => m.TestProfileListComponent)
  },
  { 
    path: 'laboratory-orders',
    canActivate: [authGuard],
    loadComponent: () => import('./components/laboratory-orders/laboratory-order-list/laboratory-order-list.component').then(m => m.LaboratoryOrderListComponent)
  },
  { 
    path: 'laboratory-orders/create',
    canActivate: [authGuard],
    loadComponent: () => import('./components/laboratory-orders/laboratory-order-form/laboratory-order-form.component').then(m => m.LaboratoryOrderFormComponent)
  },
  { 
    path: 'laboratory-orders/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./components/laboratory-orders/laboratory-order-detail/laboratory-order-detail.component').then(m => m.LaboratoryOrderDetailComponent)
  },
  { 
    path: 'laboratory-orders/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./components/laboratory-orders/laboratory-order-form/laboratory-order-form.component').then(m => m.LaboratoryOrderFormComponent)
  },
  { 
    path: 'test-results',
    canActivate: [authGuard],
    loadComponent: () => import('./components/test-results/test-result-list/test-result-list.component').then(m => m.TestResultListComponent)
  },
  { 
    path: 'test-results/create',
    canActivate: [authGuard],
    loadComponent: () => import('./components/test-results/test-result-form/test-result-form.component').then(m => m.TestResultFormComponent)
  },
  { 
    path: 'test-results/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./components/test-results/test-result-form/test-result-form.component').then(m => m.TestResultFormComponent)
  },
  { 
    path: 'test-results/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./components/test-results/test-result-form/test-result-form.component').then(m => m.TestResultFormComponent)
  },
  { 
    path: 'patients',
    canActivate: [authGuard],
    loadComponent: () => import('./components/patient/patient-list/patient-list.component').then(m => m.PatientListComponent)
  },
  { 
    path: 'patients/new',
    canActivate: [authGuard],
    loadComponent: () => import('./components/patient/patient-form/patient-form.component').then(m => m.PatientFormComponent)
  },
  { 
    path: 'patients/edit/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./components/patient/patient-form/patient-form.component').then(m => m.PatientFormComponent)
  },
  { 
    path: 'patient-history',
    canActivate: [authGuard],
    loadComponent: () => import('./components/patient/patient-history/patient-history.component').then(m => m.PatientHistoryComponent)
  },
  { 
    path: 'doctors',
    canActivate: [authGuard],
    loadComponent: () => import('./components/doctor/doctor-list/doctor-list.component').then(m => m.DoctorListComponent)
  },

  // Ruta wildcard - redirige a dashboard
  { path: '**', redirectTo: '/dashboard' }
];
